<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\OAuthController;

//OAuth Google
Route::get('/auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);



Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');


