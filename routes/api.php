<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;


//Login
Route::post('/login', [LoginController::class, 'login']);


//Register
Route::post('/register', [RegisterController::class, 'register']);

Route::middleware(['auth:sanctum'])->group(function () {
    // user routes (any authenticated user)
    Route::get('/user', [UserProfileController::class, 'me']);
    Route::put('/user', [UserProfileController::class, 'update']);
    Route::put('/user/password', [UserProfileController::class, 'changePassword']);

    // admin routes (only admin)
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    });
});
