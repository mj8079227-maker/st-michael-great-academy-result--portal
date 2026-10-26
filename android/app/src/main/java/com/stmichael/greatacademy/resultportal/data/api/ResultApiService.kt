package com.stmichael.greatacademy.resultportal.data.api

import com.stmichael.greatacademy.resultportal.data.model.VerifyResultRequest
import com.stmichael.greatacademy.resultportal.data.model.VerifyResultResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

interface ResultApiService {

    @Headers("Content-Type: application/json")
    @POST("api/public/verify-result")
    suspend fun verifyResult(
        @Body request: VerifyResultRequest
    ): Response<VerifyResultResponse>
}
