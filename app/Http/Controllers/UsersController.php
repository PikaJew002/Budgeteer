<?php

namespace App\Http\Controllers;

use App\User;
use App\Notifications\UserVerified;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display the current user logged in
     *
     *
     */
     public function loggedin(Request $request) {
        $user = $request->user();

        return new UserResource($user);
     }

    /**
     * Change resource verified column from false to true.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verify($id)
    {
        $user = User::findOrFail($id);
        if(Auth::user()->id == 1) {
            if($user->verified == false) {
                $user->verified = true;
                $user->save();
                try {
                    $user->notify(new UserVerified);
                } finally {
                    return redirect()->route('user.verified', ['user' => $user]);
                }
            }
            return redirect()->route('app');
        } else {
            return redirect()->route('app');
        }
    }

    /**
     * Change resource verified column from false to true.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verified(Request $request, $id)
    {
        $user = User::findOrFail($id);
        return view('user_verified', ['user' => $user]);
    }
}
