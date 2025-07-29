<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie','departements/import'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // React dev server
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
]; 
