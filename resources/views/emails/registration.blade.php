@component('mail::message')
# Selamat datang, {{ $user->name }}

Terima kasih sudah mendaftar di {{ config('app.name') }}.

Email: {{ $user->email }}

Jika itu bukan Anda, abaikan email ini.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
