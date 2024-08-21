<?php

use App\Http\Controllers\UsersController;
use App\Http\Controllers\Web\AppController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;

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

Route::get('/', [AppController::class, 'getApp'])->name('app');
Route::get('/logout', [AppController::class, 'getLogout'])->name('logout');

Route::middleware('auth')->name('user.')->group(function () {
    Route::get('/user/verify/{user}', [UsersController::class, 'verify'])->name('verify');
    Route::get('/user_verified/{user}', [UsersController::class, 'verified'])->name('verified');
    Route::get('/user/create-token', function (Request $request) {
        $token = $request->user()->createToken('paychecks-leftover', ['fetch-leftover']);

        return view('create_token', ['token' => $token->plainTextToken]);
    });
});
