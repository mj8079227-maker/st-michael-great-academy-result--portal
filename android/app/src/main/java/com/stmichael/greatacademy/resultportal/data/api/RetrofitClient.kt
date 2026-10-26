package com.stmichael.greatacademy.resultportal.data.api

import android.content.Context
import android.content.SharedPreferences
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private const val PREFS_NAME = "st_michael_portal_prefs"
    private const val KEY_BASE_URL = "portal_backend_url"

    // Default to the school's live Cloud Run result portal
    const val DEFAULT_BASE_URL = "https://ais-pre-yxhtecahnezg43ic3h5omk-29836764747.europe-west2.run.app/"

    private var currentRetrofit: Retrofit? = null
    private var currentBaseUrl: String? = null
    private var cachedApiService: ResultApiService? = null

    fun getBaseUrl(context: Context): String {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var url = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        if (!url.endsWith("/")) {
            url += "/"
        }
        return url
    }

    fun setCustomBaseUrl(context: Context, newUrl: String) {
        var formatted = newUrl.trim()
        if (formatted.isNotEmpty()) {
            if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
                formatted = "https://$formatted"
            }
            if (!formatted.endsWith("/")) {
                formatted += "/"
            }
            val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_BASE_URL, formatted).apply()

            // Reset cached instance
            currentRetrofit = null
            currentBaseUrl = null
            cachedApiService = null
        }
    }

    fun resetToDefaultBaseUrl(context: Context) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_BASE_URL).apply()
        currentRetrofit = null
        currentBaseUrl = null
        cachedApiService = null
    }

    fun getApiService(context: Context): ResultApiService {
        val activeUrl = getBaseUrl(context)
        if (cachedApiService != null && currentBaseUrl == activeUrl) {
            return cachedApiService!!
        }

        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(activeUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        currentRetrofit = retrofit
        currentBaseUrl = activeUrl
        cachedApiService = retrofit.create(ResultApiService::class.java)

        return cachedApiService!!
    }
}
