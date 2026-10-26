package com.stmichael.greatacademy.resultportal.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stmichael.greatacademy.resultportal.R
import com.stmichael.greatacademy.resultportal.ui.theme.*
import com.stmichael.greatacademy.resultportal.ui.viewmodel.ResultUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    uiState: ResultUiState,
    onNameChange: (String) -> Unit,
    onPinChange: (String) -> Unit,
    onCheckResult: () -> Unit,
    onUpdateServerUrl: (String) -> Unit,
    onResetServerUrl: () -> Unit,
    modifier: Modifier = Modifier
) {
    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()
    var showServerConfigDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "ST. MICHAEL GREAT ACADEMY",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = AcademyWhite,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    )
                },
                actions = {
                    IconButton(onClick = { showServerConfigDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Portal Server Settings",
                            tint = AcademyGoldLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AcademyNavy
                )
            )
        },
        containerColor = AcademyBackground,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header card with School Logo, School Name, Portal Title, and Motto
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AcademyNavy),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp, horizontal = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // School Logo with subtle gold border
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .clip(CircleShape)
                                .border(2.5.dp, AcademyGold, CircleShape)
                                .background(AcademyWhite),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.school_logo),
                                contentDescription = "St. Michael Great Academy Official Crest",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier
                                    .size(88.dp)
                                    .clip(CircleShape)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "ST. MICHAEL GREAT ACADEMY",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                color = AcademyWhite,
                                fontWeight = FontWeight.ExtraBold,
                                fontFamily = FontFamily.Serif,
                                letterSpacing = 1.sp
                            ),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Subtle gold badge for OFFICIAL RESULT PORTAL
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = AcademyNavyLight,
                            border = androidx.compose.foundation.BorderStroke(1.dp, AcademyGold),
                            modifier = Modifier.padding(vertical = 6.dp)
                        ) {
                            Text(
                                text = "OFFICIAL RESULT PORTAL",
                                color = AcademyGold,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.5.sp,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp)
                            )
                        }

                        Text(
                            text = "Motto: Learning is fun",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = AcademyGoldLight,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                letterSpacing = 0.5.sp
                            ),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Verification Form Card
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AcademyCardBg),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AcademyBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        Text(
                            text = "Student Result Verification",
                            style = MaterialTheme.typography.titleLarge.copy(
                                color = AcademyNavy,
                                fontWeight = FontWeight.Bold
                            )
                        )

                        Text(
                            text = "Please enter your official student credentials below to view your terminal academic performance.",
                            style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                            modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                        )

                        // Error Banner if present
                        if (!uiState.errorMessage.isNullOrBlank()) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFFFEF2F2),
                                border = androidx.compose.foundation.BorderStroke(1.dp, AcademyError.copy(alpha = 0.5f)),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Warning,
                                        contentDescription = "Error",
                                        tint = AcademyError,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = uiState.errorMessage,
                                        color = AcademyError,
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                                    )
                                }
                            }
                        }

                        // Field 1: Student Full Name
                        Text(
                            text = stringResource(R.string.student_name_label),
                            style = MaterialTheme.typography.labelLarge.copy(
                                color = AcademyNavy,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        OutlinedTextField(
                            value = uiState.studentFullName,
                            onValueChange = onNameChange,
                            placeholder = {
                                Text(
                                    text = "e.g. Blessing or Justin Michael Edenojie",
                                    color = AcademyTextMuted
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = AcademyNavyLight
                                )
                            },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                capitalization = KeyboardCapitalization.Words,
                                imeAction = ImeAction.Next
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AcademyNavy,
                                unfocusedBorderColor = AcademyBorder,
                                focusedContainerColor = AcademyWhite,
                                unfocusedContainerColor = AcademyParchment
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 18.dp)
                        )

                        // Field 2: Result PIN
                        Text(
                            text = stringResource(R.string.pin_label),
                            style = MaterialTheme.typography.labelLarge.copy(
                                color = AcademyNavy,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        OutlinedTextField(
                            value = uiState.pin,
                            onValueChange = onPinChange,
                            placeholder = {
                                Text(
                                    text = "Enter 5-digit PIN (e.g. 85101)",
                                    color = AcademyTextMuted
                                )
                            },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = AcademyGoldDark
                                )
                            },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    focusManager.clearFocus()
                                    onCheckResult()
                                }
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AcademyNavy,
                                unfocusedBorderColor = AcademyBorder,
                                focusedContainerColor = AcademyWhite,
                                unfocusedContainerColor = AcademyParchment
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 24.dp)
                        )

                        // Large CHECK RESULT button
                        Button(
                            onClick = {
                                focusManager.clearFocus()
                                onCheckResult()
                            },
                            enabled = !uiState.isLoading,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AcademyNavy,
                                contentColor = AcademyWhite,
                                disabledContainerColor = AcademyNavy.copy(alpha = 0.6f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .shadow(4.dp, RoundedCornerShape(12.dp))
                        ) {
                            if (uiState.isLoading) {
                                CircularProgressIndicator(
                                    color = AcademyGold,
                                    modifier = Modifier.size(24.dp),
                                    strokeWidth = 2.5.dp
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "VERIFYING RESULT...",
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = AcademyGold,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.sp
                                    )
                                )
                            } else {
                                Text(
                                    text = stringResource(R.string.check_result_btn),
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = AcademyGold,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.5.sp,
                                        fontSize = 16.sp
                                    )
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Instructions Card
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = AcademyParchment),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AcademyBorderGold),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(AcademyGold, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = stringResource(R.string.instructions_title),
                                style = MaterialTheme.typography.titleMedium.copy(
                                    color = AcademyNavy,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Text(
                            text = stringResource(R.string.instructions_step_1),
                            style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                            modifier = Modifier.padding(vertical = 3.dp)
                        )
                        Text(
                            text = stringResource(R.string.instructions_step_2),
                            style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                            modifier = Modifier.padding(vertical = 3.dp)
                        )
                        Text(
                            text = stringResource(R.string.instructions_step_3),
                            style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                            modifier = Modifier.padding(vertical = 3.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(30.dp))

                // Footer with school details
                Text(
                    text = "ST. MICHAEL GREAT ACADEMY • EST. 2023",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = AcademyTextMuted,
                        letterSpacing = 1.sp,
                        fontWeight = FontWeight.SemiBold
                    ),
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "Secure Result Checking System • Single-Use Security PIN Protected",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = AcademyTextMuted,
                        fontSize = 11.sp
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }

    // Config Dialog for Portal Backend URL (allows changing backend without rebuilding)
    if (showServerConfigDialog) {
        var tempUrl by remember { mutableStateOf(uiState.serverUrl) }
        AlertDialog(
            onDismissRequest = { showServerConfigDialog = false },
            title = {
                Text(
                    text = "Portal Backend Configuration",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column {
                    Text(
                        text = "The app connects to the official St. Michael Great Academy web portal to verify real student results.",
                        style = MaterialTheme.typography.bodySmall,
                        color = AcademyTextSecondary,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    OutlinedTextField(
                        value = tempUrl,
                        onValueChange = { tempUrl = it },
                        label = { Text("Portal Server URL") },
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(
                        onClick = {
                            onResetServerUrl()
                            showServerConfigDialog = false
                        }
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reset to Default Live URL")
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onUpdateServerUrl(tempUrl)
                        showServerConfigDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AcademyNavy)
                ) {
                    Text("Save URL")
                }
            },
            dismissButton = {
                TextButton(onClick = { showServerConfigDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
