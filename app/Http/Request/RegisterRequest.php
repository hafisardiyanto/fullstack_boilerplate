<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true; // boleh public, validasi lain dilakukan di controller
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email'=> 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:user,admin',
            'admin_code' => 'nullable|string'
        ];
    }

    public function messages()
    {
        return [
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
