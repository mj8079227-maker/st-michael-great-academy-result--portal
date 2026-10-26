package com.stmichael.greatacademy.resultportal.data.repository

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.stmichael.greatacademy.resultportal.data.api.RetrofitClient
import com.stmichael.greatacademy.resultportal.data.model.VerifyResultRequest
import com.stmichael.greatacademy.resultportal.data.model.VerifyResultResponse
import com.stmichael.greatacademy.resultportal.util.NetworkUtil

class ResultRepository(private val context: Context) {

    private val gson = Gson()

    suspend fun verifyResult(
        studentFullName: String,
        pin: String
    ): VerificationOutcome {
        val trimmedName = studentFullName.trim()
        val trimmedPin = pin.trim()

        // Rule 1: Empty fields check
        if (trimmedName.isEmpty() || trimmedPin.isEmpty()) {
            return VerificationOutcome.Error("Please enter your full name and result PIN.")
        }

        // Rule 2: Offline check
        if (!NetworkUtil.isInternetAvailable(context)) {
            return VerificationOutcome.Error("You are offline. Please connect to the internet to verify your result.")
        }

        return try {
            val apiService = RetrofitClient.getApiService(context)
            val request = VerifyResultRequest(
                studentFullName = trimmedName,
                pin = trimmedPin
            )

            val response = apiService.verifyResult(request)

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null && body.success && body.result != null) {
                    VerificationOutcome.Success(
                        result = body.result,
                        schoolSettings = body.schoolSettings,
                        message = body.message ?: "Result verified successfully."
                    )
                } else {
                    VerificationOutcome.Error(body?.message ?: "Unable to verify result. Please try again.")
                }
            } else {
                // Parse 400 Bad Request error payload returned by portal backend
                val errorBodyString = response.errorBody()?.string()
                val parsedErrorMessage = try {
                    if (!errorBodyString.isNullOrBlank()) {
                        val type = object : TypeToken<Map<String, Any>>() {}.type
                        val errorMap: Map<String, Any> = gson.fromJson(errorBodyString, type)
                        errorMap["message"]?.toString()
                    } else null
                } catch (e: Exception) {
                    null
                }

                val finalMessage = parsedErrorMessage
                    ?: when (response.code()) {
                        400 -> "Incorrect student name or PIN. Please check your details and try again."
                        404 -> "Server endpoint not found. Please verify your portal URL."
                        500 -> "Server error encountered. Please contact the school."
                        else -> "Verification failed (HTTP ${response.code()}). Please try again."
                    }

                VerificationOutcome.Error(finalMessage)
            }
        } catch (e: java.net.UnknownHostException) {
            VerificationOutcome.Error("You are offline. Please connect to the internet to verify your result.")
        } catch (e: java.net.SocketTimeoutException) {
            VerificationOutcome.Error("Server response timed out. Please check your internet connection and try again.")
        } catch (e: Exception) {
            VerificationOutcome.Error(e.localizedMessage ?: "Network connection error. Please try again.")
        }
    }
}

sealed class VerificationOutcome {
    data class Success(
        val result: com.stmichael.greatacademy.resultportal.data.model.StudentResultDto,
        val schoolSettings: com.stmichael.greatacademy.resultportal.data.model.SchoolSettingsDto?,
        val message: String
    ) : VerificationOutcome()

    data class Error(val message: String) : VerificationOutcome()
}
