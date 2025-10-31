<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $role
     */
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        if ($role && $request->user() && $request->user()->role !== $role) {
            // Jika bukan role yang diizinkan
            return response()->json(['message' => 'Forbidden. Access denied.'], 403);
        }

        // Jika tidak ada role diberikan, lanjutkan saja
        return $next($request);
    }
}
