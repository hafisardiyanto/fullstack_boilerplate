<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
   // untuk request yang mengharapkan JSON, jangan redirect—kembalikan 401
    if ($request->expectsJson() || $request->is('api/*')) {
        abort(response()->json(['message' => 'Unauthenticated.'], 401));
    }
    return route('login'); // fallback untuk web
}
