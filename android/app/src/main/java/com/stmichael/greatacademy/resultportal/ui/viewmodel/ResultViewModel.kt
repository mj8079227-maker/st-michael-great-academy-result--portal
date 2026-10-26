package com.stmichael.greatacademy.resultportal.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.stmichael.greatacademy.resultportal.data.api.RetrofitClient
import com.stmichael.greatacademy.resultportal.data.model.SchoolSettingsDto
import com.stmichael.greatacademy.resultportal.data.model.StudentResultDto
import com.stmichael.greatacademy.resultportal.data.repository.ResultRepository
import com.stmichael.greatacademy.resultportal.data.repository.VerificationOutcome
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ResultUiState(
    val studentFullName: String = "",
    val pin: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val verifiedResult: StudentResultDto? = null,
    val schoolSettings: SchoolSettingsDto? = null,
    val serverUrl: String = ""
)

class ResultViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = ResultRepository(application)

    private val _uiState = MutableStateFlow(
        ResultUiState(serverUrl = RetrofitClient.getBaseUrl(application))
    )
    val uiState: StateFlow<ResultUiState> = _uiState.asStateFlow()

    fun onStudentNameChange(newName: String) {
        _uiState.update { it.copy(studentFullName = newName, errorMessage = null) }
    }

    fun onPinChange(newPin: String) {
        _uiState.update { it.copy(pin = newPin, errorMessage = null) }
    }

    fun checkResult() {
        val currentName = _uiState.value.studentFullName.trim()
        val currentPin = _uiState.value.pin.trim()

        // Exact Rule: Empty fields
        if (currentName.isEmpty() || currentPin.isEmpty()) {
            _uiState.update {
                it.copy(
                    errorMessage = "Please enter your full name and result PIN.",
                    successMessage = null
                )
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null, successMessage = null) }

            when (val outcome = repository.verifyResult(currentName, currentPin)) {
                is VerificationOutcome.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            verifiedResult = outcome.result,
                            schoolSettings = outcome.schoolSettings,
                            successMessage = outcome.message,
                            errorMessage = null
                        )
                    }
                }
                is VerificationOutcome.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = outcome.message,
                            successMessage = null
                        )
                    }
                }
            }
        }
    }

    fun clearResult() {
        _uiState.update {
            it.copy(
                studentFullName = "",
                pin = "",
                isLoading = false,
                errorMessage = null,
                successMessage = null,
                verifiedResult = null
            )
        }
    }

    fun updateServerUrl(newUrl: String) {
        RetrofitClient.setCustomBaseUrl(getApplication(), newUrl)
        _uiState.update { it.copy(serverUrl = RetrofitClient.getBaseUrl(getApplication())) }
    }

    fun resetServerUrl() {
        RetrofitClient.resetToDefaultBaseUrl(getApplication())
        _uiState.update { it.copy(serverUrl = RetrofitClient.getBaseUrl(getApplication())) }
    }
}
