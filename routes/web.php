<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/', 'Web\AppController@getApp')->name('app');
Route::get('/logout', 'Web\AppController@getLogout')->name('logout');

Route::get('/user/verify/{user}', ['as' => 'user.verify', 'uses' => 'UsersController@verify'])->middleware('auth');
Route::get('/user_verified/{user}', ['as' => 'user.verified', 'uses' => 'UsersController@verified'])->middleware('auth');
//Route::post('/login', 'Web\AppController@postLogin');
// Route::post('login', function (Request $request) {
//
//     if(Auth::attempt(['email' => $request->input('email'), 'password' => $request->input('password')])) {
//         // Authentication passed...
//         $request->session()->regenerate();
//         return response()->json([
//             'error' => 'User logged in',
//             'code' => 200,
//         ], 200);;
//     }
//
//     return response()->json([
//         'error' => 'Unauthenticated user',
//         'code' => 401,
//     ], 401);
// });
//
// Route::middleware('auth:api')->post('logout', function (Request $request) {
//     if(Auth::check()) {
//         Auth::logout();
//         $request->session()->invalidate();
//         return response()->json([
//             'message' => 'Thank you for using our application',
//         ]);
//     }
//
//     return response()->json([
//         'error' => 'Unable to logout user',
//         'code' => 401,
//     ], 401);
// });
