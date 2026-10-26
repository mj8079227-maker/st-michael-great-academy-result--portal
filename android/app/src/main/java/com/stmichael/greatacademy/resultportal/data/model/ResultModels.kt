package com.stmichael.greatacademy.resultportal.data.model

import com.google.gson.annotations.SerializedName

data class VerifyResultRequest(
    @SerializedName("studentFullName")
    val studentFullName: String,
    @SerializedName("pin")
    val pin: String
)

data class VerifyResultResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("message")
    val message: String? = null,
    @SerializedName("result")
    val result: StudentResultDto? = null,
    @SerializedName("schoolSettings")
    val schoolSettings: SchoolSettingsDto? = null,
    @SerializedName("activeBackground")
    val activeBackground: BackgroundDto? = null
)

data class StudentResultDto(
    @SerializedName("id")
    val id: String = "",
    @SerializedName("studentId")
    val studentId: String = "",
    @SerializedName("studentNumber")
    val studentNumber: String = "",
    @SerializedName("studentFullName")
    val studentFullName: String = "",
    @SerializedName("className")
    val className: String = "",
    @SerializedName("academicSession")
    val academicSession: String = "",
    @SerializedName("term")
    val term: String = "",
    @SerializedName("subjects")
    val subjects: List<SubjectDto> = emptyList(),
    @SerializedName("totalScore")
    val totalScore: Double? = 0.0,
    @SerializedName("averageScore")
    val averageScore: Double? = 0.0,
    @SerializedName("overallGrade")
    val overallGrade: String? = "",
    @SerializedName("teacherRemark")
    val teacherRemark: String? = "",
    @SerializedName("principalRemark")
    val principalRemark: String? = "",
    @SerializedName("signedBy")
    val signedBy: String? = "",
    @SerializedName("isPublished")
    val isPublished: Boolean? = true,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

data class SubjectDto(
    @SerializedName("id")
    val id: String? = null,
    @SerializedName("subject")
    val subject: String = "",
    @SerializedName("ca1")
    val ca1: Double? = 0.0,
    @SerializedName("ca2")
    val ca2: Double? = 0.0,
    @SerializedName("exam")
    val exam: Double? = 0.0,
    @SerializedName("total")
    val total: Double? = 0.0,
    @SerializedName("grade")
    val grade: String? = "-",
    @SerializedName("remark")
    val remark: String? = ""
)

data class SchoolSettingsDto(
    @SerializedName("schoolName")
    val schoolName: String? = "ST. MICHAEL GREAT ACADEMY",
    @SerializedName("portalTitle")
    val portalTitle: String? = "OFFICIAL RESULT PORTAL",
    @SerializedName("motto")
    val motto: String? = "Learning is fun",
    @SerializedName("currentSession")
    val currentSession: String? = "2026/2027",
    @SerializedName("currentTerm")
    val currentTerm: String? = "First Term",
    @SerializedName("logoUrl")
    val logoUrl: String? = null
)

data class BackgroundDto(
    @SerializedName("id")
    val id: String? = null,
    @SerializedName("title")
    val title: String? = null,
    @SerializedName("imageUrl")
    val imageUrl: String? = null
)
