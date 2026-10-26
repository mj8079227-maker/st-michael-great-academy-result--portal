package com.stmichael.greatacademy.resultportal.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val AcademyColorScheme = lightColorScheme(
    primary = AcademyNavy,
    onPrimary = AcademyWhite,
    primaryContainer = AcademyNavyLight,
    onPrimaryContainer = AcademyWhite,
    secondary = AcademyGold,
    onSecondary = AcademyNavy,
    secondaryContainer = AcademyGoldLight,
    onSecondaryContainer = AcademyNavyDark,
    background = AcademyBackground,
    onBackground = AcademyTextPrimary,
    surface = AcademyCardBg,
    onSurface = AcademyTextPrimary,
    surfaceVariant = AcademyParchment,
    onSurfaceVariant = AcademyTextSecondary,
    outline = AcademyBorder,
    error = AcademyError,
    onError = AcademyWhite
)

@Composable
fun StMichaelGreatAcademyTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = AcademyNavy.toArgb()
                window.navigationBarColor = AcademyNavy.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = AcademyColorScheme,
        typography = AcademyTypography,
        content = content
    )
}
