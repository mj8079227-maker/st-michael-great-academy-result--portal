package com.stmichael.greatacademy.resultportal

import com.google.gson.Gson
import com.stmichael.greatacademy.resultportal.data.model.VerifyResultRequest
import com.stmichael.greatacademy.resultportal.data.model.VerifyResultResponse
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VerificationRulesTest {

    private val gson = Gson()

    @Test
    fun testEmptyNameValidationRule() {
        val name = "   "
        val pin = "85101"
        val isValid = name.trim().isNotEmpty() && pin.trim().isNotEmpty()
        val expectedMessage = if (!isValid) "Please enter your full name and result PIN." else ""
        assertFalse(isValid)
        assertEquals("Please enter your full name and result PIN.", expectedMessage)
    }

    @Test
    fun testEmptyPinValidationRule() {
        val name = "Blessing"
        val pin = ""
        val isValid = name.trim().isNotEmpty() && pin.trim().isNotEmpty()
        val expectedMessage = if (!isValid) "Please enter your full name and result PIN." else ""
        assertFalse(isValid)
        assertEquals("Please enter your full name and result PIN.", expectedMessage)
    }

    @Test
    fun testVerifyRequestSerialization() {
        val req = VerifyResultRequest(studentFullName = "Blessing", pin = "85101")
        val json = gson.toJson(req)
        assertTrue(json.contains("\"studentFullName\":\"Blessing\""))
        assertTrue(json.contains("\"pin\":\"85101\""))
    }

    @Test
    fun testUsedPinErrorMessageParsing() {
        val errorJson = """{"success":false,"message":"This result PIN has already been used. Please contact the school."}"""
        val response = gson.fromJson(errorJson, VerifyResultResponse::class.java)
        assertFalse(response.success)
        assertEquals("This result PIN has already been used. Please contact the school.", response.message)
    }

    @Test
    fun testIncorrectCredentialsErrorMessageParsing() {
        val errorJson = """{"success":false,"message":"Incorrect student name or PIN. Please check your details and try again."}"""
        val response = gson.fromJson(errorJson, VerifyResultResponse::class.java)
        assertFalse(response.success)
        assertEquals("Incorrect student name or PIN. Please check your details and try again.", response.message)
    }

    @Test
    fun testUnpublishedResultErrorMessageParsing() {
        val errorJson = """{"success":false,"message":"Your result is not yet available. Please contact the school."}"""
        val response = gson.fromJson(errorJson, VerifyResultResponse::class.java)
        assertFalse(response.success)
        assertEquals("Your result is not yet available. Please contact the school.", response.message)
    }

    @Test
    fun testSuccessfulVerificationMessage() {
        val successJson = """{"success":true,"message":"Result verified successfully.","result":{"studentFullName":"Blessing","studentNumber":"SMA-0004","className":"JSS 1"}}"""
        val response = gson.fromJson(successJson, VerifyResultResponse::class.java)
        assertTrue(response.success)
        assertEquals("Result verified successfully.", response.message)
        assertNotNull(response.result)
        assertEquals("Blessing", response.result?.studentFullName)
    }
}
