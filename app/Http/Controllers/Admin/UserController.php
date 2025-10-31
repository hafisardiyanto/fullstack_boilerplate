<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // GET /api/admin/users
    public function index(Request $request)
    {
        $q = $request->query('q');
        $users = User::when($q, fn($qB) => $qB->where('name', 'like', "%{$q}%")->orWhere('email','like',"%{$q}%"))
                     ->orderBy('id','desc')
                     ->paginate(20);
        return response()->json($users);
    }

    // POST /api/admin/users
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|email|unique:users,email',
            'password'=>'nullable|string|min:8',
            'role'=>['required', Rule::in(['admin','user'])],
            'phone'=>'nullable|string'
        ]);

        $user = User::create([
            'name'=>$data['name'],
            'email'=>$data['email'],
            'phone'=>$data['phone'] ?? null,
            'role'=>$data['role'],
            'password'=> isset($data['password']) ? Hash::make($data['password']) : null,
        ]);

        return response()->json(['message'=>'User created','data'=>$user], 201);
    }

    // GET /api/admin/users/{id}
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    // PUT /api/admin/users/{id}
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name'=>'sometimes|required|string|max:255',
            'email'=>['sometimes','required','email', Rule::unique('users','email')->ignore($user->id)],
            'role'=>['sometimes','required', Rule::in(['admin','user'])],
            'password'=>'nullable|string|min:8',
            'phone'=>'nullable|string'
        ]);

        if (isset($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        foreach (['name','email','role','phone'] as $f) {
            if (isset($data[$f])) $user->$f = $data[$f];
        }
        $user->save();
        return response()->json(['message'=>'User updated','data'=>$user]);
    }

    // DELETE /api/admin/users/{id}
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message'=>'User deleted']);
    }
}
