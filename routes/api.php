<?php

use App\Http\Controllers\BillPaycheckController;
use App\Http\Controllers\BillsController;
use App\Http\Controllers\IncomesController;
use App\Http\Controllers\PaychecksController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::name('income.')->controller(IncomesController::class)->group(function () {
    Route::get('income', 'index')->name('index');
    Route::get('income/{income}', 'show')->name('show');
    Route::post('income', 'store')->name('store');
    Route::put('income', 'update')->name('update');
    Route::delete('income/{income}', 'destroy')->name('destroy');
});

Route::name('bill.')->controller(BillsController::class)->group(function () {
    Route::get('bill', 'index')->name('index');
    Route::get('bill/{bill}', 'show')->name('show');
    Route::post('bill', 'store')->name('store');
    Route::put('bill', 'update')->name('update');
    Route::delete('bill/{bill}', 'destroy')->name('destroy');
});

Route::name('paycheck.')->controller(PaychecksController::class)->group(function () {
    Route::get('paycheck', 'index')->name('index');
    Route::get('paycheck/{paycheck}', 'show')->name('show');
    Route::get('paycheck/leftover/{year}/{month}', 'leftover')->name('leftover');
    Route::post('paycheck', 'store')->name('store');
    Route::put('paycheck', 'update')->name('update');
    Route::delete('paycheck/{paycheck}', 'destroy')->name('destroy');
});

Route::name('billpaycheck.')->controller(BillPaycheckController::class)->group(function () {
    Route::post('billpaycheck', 'store')->name('store');
    Route::put('billpaycheck', 'update')->name('update');
    Route::delete('billpaycheck/{bill}/{paycheck}', 'destroy')->name('destroy');
});

Route::get('user', [UsersController::class, 'loggedin'])->name('user.loggedin');
