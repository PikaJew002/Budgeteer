<?php

namespace App\Http\Controllers;

use App\User;
use App\Notifications\UserVerified;
use Auth;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api')->except(['verify', 'verified']);
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
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Change resource verified column from false to true.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verify(Request $request, User $user)
    {
        if(Auth::user()->id == 1) {
            if($user->verified == false) {
                $user->verified = true;
                $user->save();
                $user->notify(new UserVerified);
            }
            return redirect()->route('user.verified', ['user' => $user->id]);
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
    public function verified(Request $request, User $user)
    {
        return view('user_verified', ['user' => $user]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        //
    }
}
