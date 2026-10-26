# ProGuard rules for St. Michael Great Academy Result Portal
-keep class com.stmichael.greatacademy.resultportal.data.model.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
