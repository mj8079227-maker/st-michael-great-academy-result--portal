package com.stmichael.greatacademy.resultportal.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stmichael.greatacademy.resultportal.R
import com.stmichael.greatacademy.resultportal.data.model.SchoolSettingsDto
import com.stmichael.greatacademy.resultportal.data.model.StudentResultDto
import com.stmichael.greatacademy.resultportal.data.model.SubjectDto
import com.stmichael.greatacademy.resultportal.ui.components.PrintUtils
import com.stmichael.greatacademy.resultportal.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultScreen(
    result: StudentResultDto,
    schoolSettings: SchoolSettingsDto?,
    onCheckAnother: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Official Result Slip",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = AcademyWhite,
                            fontWeight = FontWeight.Bold
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onCheckAnother) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back to Home",
                            tint = AcademyWhite
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { PrintUtils.shareResultSummary(context, result) }) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Result",
                            tint = AcademyGoldLight
                        )
                    }
                    IconButton(onClick = { PrintUtils.printResultSlip(context, result, schoolSettings) }) {
                        Icon(
                            imageVector = Icons.Default.Print,
                            contentDescription = "Print Result",
                            tint = AcademyGold
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AcademyNavy
                )
            )
        },
        bottomBar = {
            Surface(
                color = AcademyWhite,
                shadowElevation = 8.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, AcademyBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onCheckAnother,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, AcademyNavy),
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp)
                    ) {
                        Text(
                            text = "NEW CHECK",
                            color = AcademyNavy,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    Button(
                        onClick = { PrintUtils.printResultSlip(context, result, schoolSettings) },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AcademyNavy,
                            contentColor = AcademyWhite
                        ),
                        modifier = Modifier
                            .weight(1.3f)
                            .height(50.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Print,
                            contentDescription = null,
                            tint = AcademyGold,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "PRINT RESULT",
                            color = AcademyGold,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }
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
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Official Result Certificate Card
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AcademyWhite),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, AcademyGold),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // School Header Banner
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .clip(CircleShape)
                                .border(2.dp, AcademyGold, CircleShape)
                                .background(AcademyWhite),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.school_logo),
                                contentDescription = "School Logo",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier
                                    .size(76.dp)
                                    .clip(CircleShape)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "ST. MICHAEL GREAT ACADEMY",
                            style = MaterialTheme.typography.titleLarge.copy(
                                color = AcademyNavy,
                                fontWeight = FontWeight.ExtraBold,
                                fontFamily = FontFamily.Serif,
                                letterSpacing = 0.75.sp
                            ),
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = "OFFICIAL RESULT PORTAL",
                            style = MaterialTheme.typography.labelLarge.copy(
                                color = AcademyGoldDark,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.5.sp
                            ),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 2.dp)
                        )

                        Text(
                            text = "Learning is fun",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = AcademyTextSecondary,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                            ),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                        )

                        Divider(color = AcademyGold, thickness = 1.5.dp)

                        Spacer(modifier = Modifier.height(14.dp))

                        // Student Details Grid
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = AcademyParchment),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AcademyBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp)
                            ) {
                                InfoRow(label = "Student Full Name:", value = result.studentFullName, isBold = true)
                                InfoRow(label = "Student Number:", value = result.studentNumber)
                                InfoRow(label = "Class:", value = result.className)
                                InfoRow(label = "Academic Session:", value = result.academicSession)
                                InfoRow(label = "Term:", value = result.term)
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        // Section Header: Academic Performance
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp, 16.dp)
                                    .background(AcademyNavy, RoundedCornerShape(2.dp))
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "TERMINAL SUBJECT PERFORMANCE",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    color = AcademyNavy,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 0.5.sp,
                                    fontSize = 14.sp
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Subjects Table
                        SubjectsTable(subjects = result.subjects)

                        Spacer(modifier = Modifier.height(16.dp))

                        // Overall Summary Box
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = AcademyNavy),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 16.dp, horizontal = 12.dp),
                                horizontalArrangement = Arrangement.SpaceEvenly,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                SummaryMetric(
                                    label = "TOTAL SCORE",
                                    value = (result.totalScore ?: 0.0).toString()
                                )
                                Box(
                                    modifier = Modifier
                                        .height(36.dp)
                                        .width(1.dp)
                                        .background(AcademyNavyLight)
                                )
                                SummaryMetric(
                                    label = "AVERAGE",
                                    value = "${String.format("%.1f", result.averageScore ?: 0.0)}%"
                                )
                                Box(
                                    modifier = Modifier
                                        .height(36.dp)
                                        .width(1.dp)
                                        .background(AcademyNavyLight)
                                )
                                SummaryMetric(
                                    label = "OVERALL GRADE",
                                    value = result.overallGrade ?: "-",
                                    isGold = true
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        // Remarks & Authenticity Section
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = AcademyParchment),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AcademyBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp)
                            ) {
                                Text(
                                    text = "Class Teacher's Remark:",
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = AcademyNavy,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    text = result.teacherRemark.ifEmpty { "Commendable academic effort." },
                                    style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                                )

                                Text(
                                    text = "Administrator / Head Teacher's Remark:",
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = AcademyNavy,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    text = result.principalRemark.ifEmpty { "Promoted with pride." },
                                    style = MaterialTheme.typography.bodyMedium.copy(color = AcademyTextSecondary),
                                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                                )

                                Text(
                                    text = "Result Signed By:",
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = AcademyNavy,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    text = result.signedBy.ifEmpty { "Mrs Mary" },
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = AcademyNavy,
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Security notice (confirming PIN is never displayed)
                        Text(
                            text = "Verified Official Document • Single-Use Security PIN Verified • Issued by St. Michael Great Academy",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = AcademyTextMuted,
                                fontSize = 10.5.sp
                            ),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String, isBold: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = AcademyTextSecondary,
                fontWeight = FontWeight.Medium
            )
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = AcademyNavy,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.SemiBold
            ),
            textAlign = TextAlign.End
        )
    }
}

@Composable
private fun SubjectsTable(subjects: List<SubjectDto>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, AcademyBorder, RoundedCornerShape(8.dp))
            .clip(RoundedCornerShape(8.dp))
    ) {
        // Table Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(AcademyNavy)
                .padding(vertical = 8.dp, horizontal = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "SUBJECT",
                color = AcademyWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                modifier = Modifier.weight(2.2f)
            )
            Text(
                text = "1st CA\n(20)",
                color = AcademyWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "2nd CA\n(20)",
                color = AcademyWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "EXAM\n(60)",
                color = AcademyWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "TOTAL\n(100)",
                color = AcademyGold,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1.1f)
            )
            Text(
                text = "GRD",
                color = AcademyWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(0.9f)
            )
        }

        // Table Rows
        subjects.forEachIndexed { index, sub ->
            val isEven = index % 2 == 0
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(if (isEven) AcademyWhite else AcademyParchment)
                    .padding(vertical = 8.dp, horizontal = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = sub.subject,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = AcademyNavy,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    ),
                    modifier = Modifier.weight(2.2f)
                )
                Text(
                    text = sub.ca1?.toString() ?: "-",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = sub.ca2?.toString() ?: "-",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = sub.exam?.toString() ?: "-",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = sub.total?.toString() ?: "-",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = AcademyNavy,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1.1f)
                )
                Text(
                    text = sub.grade ?: "-",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = if (sub.grade == "A") AcademyGoldDark else AcademyNavy,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(0.9f)
                )
            }
            if (index < subjects.size - 1) {
                Divider(color = AcademyBorder, thickness = 0.5.dp)
            }
        }
    }
}

@Composable
private fun SummaryMetric(
    label: String,
    value: String,
    isGold: Boolean = false
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            color = AcademyGoldLight,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = value,
            color = if (isGold) AcademyGold else AcademyWhite,
            fontSize = 18.sp,
            fontWeight = FontWeight.ExtraBold
        )
    }
}
