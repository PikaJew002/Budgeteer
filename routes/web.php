<?php

use Illuminate\Http\Request;
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

Auth::routes();

Route::get('/pasword/reset/{token}', function (Request $request, $token) {
    return response()->redirectTo('/#/reset-password-link/'.$token.'?email='.$request->email);
})->name('password.reset');

Route::get('/', 'Web\AppController@getApp')->name('app');
Route::get('/logout', 'Web\AppController@getLogout')->name('logout');

Route::get('/user/verify/{user}', ['as' => 'user.verify', 'uses' => 'UsersController@verify'])->middleware('auth');
Route::get('/user_verified/{user}', ['as' => 'user.verified', 'uses' => 'UsersController@verified'])->middleware('auth');
