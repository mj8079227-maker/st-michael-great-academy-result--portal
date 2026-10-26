package com.stmichael.greatacademy.resultportal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.stmichael.greatacademy.resultportal.ui.screens.HomeScreen
import com.stmichael.greatacademy.resultportal.ui.screens.ResultScreen
import com.stmichael.greatacademy.resultportal.ui.theme.AcademyBackground
import com.stmichael.greatacademy.resultportal.ui.theme.StMichaelGreatAcademyTheme
import com.stmichael.greatacademy.resultportal.ui.viewmodel.ResultViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: ResultViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            StMichaelGreatAcademyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = AcademyBackground
                ) {
                    val uiState by viewModel.uiState.collectAsState()

                    if (uiState.verifiedResult != null) {
                        ResultScreen(
                            result = uiState.verifiedResult!!,
                            schoolSettings = uiState.schoolSettings,
                            onCheckAnother = {
                                viewModel.clearResult()
                            }
                        )
                    } else {
                        HomeScreen(
                            uiState = uiState,
                            onNameChange = viewModel::onStudentNameChange,
                            onPinChange = viewModel::onPinChange,
                            onCheckResult = viewModel::checkResult,
                            onUpdateServerUrl = viewModel::updateServerUrl,
                            onResetServerUrl = viewModel::resetServerUrl
                        )
                    }
                }
            }
        }
    }
}
