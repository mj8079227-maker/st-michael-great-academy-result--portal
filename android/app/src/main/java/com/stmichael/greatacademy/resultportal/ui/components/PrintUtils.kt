package com.stmichael.greatacademy.resultportal.ui.components

import android.content.Context
import android.content.Intent
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import com.stmichael.greatacademy.resultportal.data.model.SchoolSettingsDto
import com.stmichael.greatacademy.resultportal.data.model.StudentResultDto

object PrintUtils {

    fun printResultSlip(
        context: Context,
        result: StudentResultDto,
        settings: SchoolSettingsDto?
    ) {
        val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager
        if (printManager == null) {
            Toast.makeText(context, "Printing not supported on this device.", Toast.LENGTH_SHORT).show()
            return
        }

        val htmlContent = generateHtmlResultSlip(result, settings)

        // Create a WebView to render HTML and feed Android PrintManager
        val webView = WebView(context).apply {
            settings.javaScriptEnabled = false
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    val jobName = "StMichaelAcademy_${result.studentNumber.ifEmpty { "Result" }}"
                    val printAdapter = createPrintDocumentAdapter(jobName)
                    val printAttributes = PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setResolution(PrintAttributes.Resolution("res1", "default", 300, 300))
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                        .build()

                    printManager.print(jobName, printAdapter, printAttributes)
                }
            }
        }

        webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null)
    }

    fun shareResultSummary(context: Context, result: StudentResultDto) {
        val summaryText = buildString {
            appendLine("ST. MICHAEL GREAT ACADEMY")
            appendLine("OFFICIAL RESULT SLIP")
            appendLine("Motto: Learning is fun")
            appendLine("----------------------------------------")
            appendLine("Student Name: ${result.studentFullName}")
            appendLine("Student Number: ${result.studentNumber}")
            appendLine("Class: ${result.className}")
            appendLine("Session: ${result.academicSession} | Term: ${result.term}")
            appendLine("----------------------------------------")
            appendLine("Total Score: ${result.totalScore ?: 0.0}")
            appendLine("Average: ${String.format("%.1f", result.averageScore ?: 0.0)}%")
            appendLine("Overall Grade: ${result.overallGrade ?: "-"}")
            appendLine("Class Teacher Remark: ${result.teacherRemark ?: "N/A"}")
            appendLine("Head Teacher Remark: ${result.principalRemark ?: "N/A"}")
            appendLine("Signed By: ${result.signedBy ?: "Mrs Mary"}")
            appendLine("----------------------------------------")
            appendLine("Verified via St. Michael Great Academy Mobile Portal")
        }

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Result: ${result.studentFullName} (${result.className})")
            putExtra(Intent.EXTRA_TEXT, summaryText)
        }
        context.startActivity(Intent.createChooser(intent, "Share Result Slip"))
    }

    private fun generateHtmlResultSlip(result: StudentResultDto, settings: SchoolSettingsDto?): String {
        val schoolName = settings?.schoolName ?: "ST. MICHAEL GREAT ACADEMY"
        val motto = settings?.motto ?: "Learning is fun"

        val subjectRows = result.subjects.joinToString("") { sub ->
            """
            <tr>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: left; font-weight: 600;">${sub.subject}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: center;">${sub.ca1 ?: "-"}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: center;">${sub.ca2 ?: "-"}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: center;">${sub.exam ?: "-"}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: #0B192C;">${sub.total ?: "-"}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: #D4AF37;">${sub.grade ?: "-"}</td>
                <td style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: left; font-size: 11px;">${sub.remark ?: ""}</td>
            </tr>
            """.trimIndent()
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0B192C; margin: 20px; background: #fff; }
                .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 16px; }
                .school-title { font-size: 22px; font-weight: 800; color: #0B192C; letter-spacing: 1px; margin: 0; }
                .portal-title { font-size: 14px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; margin: 4px 0; }
                .motto { font-size: 12px; font-style: italic; color: #64748B; margin: 0; }
                .details-grid { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
                .details-grid td { padding: 5px 8px; }
                .details-label { font-weight: 700; color: #475569; width: 18%; }
                .details-value { font-weight: 600; color: #0F172A; width: 32%; }
                table.subjects { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
                table.subjects th { background-color: #0B192C; color: #FFFFFF; padding: 8px; border: 1px solid #0B192C; text-align: center; font-size: 11px; }
                .summary-box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-around; }
                .summary-item { text-align: center; }
                .summary-label { font-size: 11px; color: #64748B; text-transform: uppercase; }
                .summary-val { font-size: 18px; font-weight: 800; color: #0B192C; }
                .remarks-box { border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; line-height: 1.5; }
                .signatures { margin-top: 24px; display: flex; justify-content: space-between; font-size: 12px; }
                .sign-line { border-top: 1px solid #0B192C; width: 200px; text-align: center; padding-top: 4px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="school-title">$schoolName</h1>
                <div class="portal-title">OFFICIAL RESULT SLIP</div>
                <div class="motto">Motto: $motto</div>
            </div>

            <table class="details-grid">
                <tr>
                    <td class="details-label">Student Name:</td>
                    <td class="details-value">${result.studentFullName}</td>
                    <td class="details-label">Student ID:</td>
                    <td class="details-value">${result.studentNumber}</td>
                </tr>
                <tr>
                    <td class="details-label">Class:</td>
                    <td class="details-value">${result.className}</td>
                    <td class="details-label">Academic Session:</td>
                    <td class="details-value">${result.academicSession}</td>
                </tr>
                <tr>
                    <td class="details-label">Term:</td>
                    <td class="details-value">${result.term}</td>
                    <td class="details-label">Date Verified:</td>
                    <td class="details-value">${java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale.ENGLISH).format(java.util.Date())}</td>
                </tr>
            </table>

            <table class="subjects">
                <thead>
                    <tr>
                        <th style="text-align: left;">Subject</th>
                        <th>1st CA (20)</th>
                        <th>2nd CA (20)</th>
                        <th>Exam (60)</th>
                        <th>Total (100)</th>
                        <th>Grade</th>
                        <th style="text-align: left;">Remark</th>
                    </tr>
                </thead>
                <tbody>
                    $subjectRows
                </tbody>
            </table>

            <div class="summary-box">
                <table style="width: 100%; text-align: center;">
                    <tr>
                        <td>
                            <div class="summary-label">Total Score</div>
                            <div class="summary-val">${result.totalScore ?: 0.0}</div>
                        </td>
                        <td>
                            <div class="summary-label">Average Score</div>
                            <div class="summary-val">${String.format("%.1f", result.averageScore ?: 0.0)}%</div>
                        </td>
                        <td>
                            <div class="summary-label">Overall Grade</div>
                            <div class="summary-val" style="color: #D4AF37;">${result.overallGrade ?: "-"}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="remarks-box">
                <p><strong>Class Teacher's Remark:</strong> ${result.teacherRemark.ifEmpty { "Commendable academic effort." }}</p>
                <p><strong>Administrator / Head Teacher's Remark:</strong> ${result.principalRemark.ifEmpty { "Promoted with pride." }}</p>
                <p><strong>Result Signed By:</strong> ${result.signedBy.ifEmpty { "Mrs Mary" }}</p>
            </div>

            <table style="width: 100%; margin-top: 40px;">
                <tr>
                    <td style="width: 50%; text-align: center;">
                        <div style="border-top: 1px solid #475569; width: 80%; margin: 0 auto; padding-top: 6px; font-weight: bold; font-size: 12px;">
                            Class Teacher's Signature
                        </div>
                    </td>
                    <td style="width: 50%; text-align: center;">
                        <div style="border-top: 1px solid #475569; width: 80%; margin: 0 auto; padding-top: 6px; font-weight: bold; font-size: 12px;">
                            ${result.signedBy.ifEmpty { "Principal / Administrator" }}
                        </div>
                    </td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 10px;">
                Official Digital Result Slip • ST. MICHAEL GREAT ACADEMY • Single-Use Security PIN Verified
            </div>
        </body>
        </html>
        """.trimIndent()
    }
}
