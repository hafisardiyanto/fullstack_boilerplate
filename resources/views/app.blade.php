<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name','Laravel React') }}</title>

    <!-- Bootstrap & Font Awesome (optional, from your original HTML) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
    <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>

    @if (app()->environment('local'))
        @viteReactRefresh
    @endif
    @vite(['resources/js/src/main.jsx'])

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/js/chart-area-demo.js"></script>
<script src="/js/chart-bar-demo.js"></script>
<script src="/js/chart-pie-demo.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link rel="stylesheet" href="/css/datatables.min.css">
<script src="/js/datatables-demo.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
