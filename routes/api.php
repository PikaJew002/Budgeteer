<?php

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

Route::get('goal', ['as' => 'goal.index', 'uses' => 'GoalsController@index']);
Route::get('goal/{goal}', ['as' => 'goal.show', 'uses' => 'GoalsController@show']);
Route::post('goal', ['as' => 'goal.store', 'uses' => 'GoalsController@store']);
Route::put('goal', ['as' => 'goal.update', 'uses' => 'GoalsController@update']);
Route::delete('goal/{goal}', ['as' => 'goal.destroy', 'uses' => 'GoalsController@destroy']);

Route::get('contribution', ['as' => 'contribution.index', 'uses' => 'ContributionsController@index']);
Route::get('contribution/{contribution}', ['as' => 'contribution.show', 'uses' => 'ContributionsController@show']);
Route::post('contribution', ['as' => 'contribution.store', 'uses' => 'ContributionsController@store']);
Route::put('contribution', ['as' => 'contribution.update', 'uses' => 'ContributionsController@update']);
Route::delete('contribution/{contribution}', ['as' => 'contribution.destroy', 'uses' => 'ContributionsController@destroy']);

Route::get('income', ['as' => 'income.index', 'uses' => 'IncomesController@index']);
Route::get('income/{income}', ['as' => 'income.show', 'uses' => 'IncomesController@show']);
Route::post('income', ['as' => 'income.store', 'uses' => 'IncomesController@store']);
Route::put('income', ['as' => 'income.update', 'uses' => 'IncomesController@update']);
Route::delete('income/{income}', ['as' => 'income.destroy', 'uses' => 'IncomesController@destroy']);

Route::get('bill', ['as' => 'bill.index', 'uses' => 'BillsController@index']);
Route::get('bill/{bill}', ['as' => 'bill.show', 'uses' => 'BillsController@show']);
Route::post('bill', ['as' => 'bill.store', 'uses' => 'BillsController@store']);
Route::put('bill', ['as' => 'bill.update', 'uses' => 'BillsController@update']);
Route::delete('bill/{bill}', ['as' => 'bill.destroy', 'uses' => 'BillsController@destroy']);

Route::get('paycheck', ['as' => 'paycheck.index', 'uses' => 'PaychecksController@index']);
Route::get('paycheck/{paycheck}', ['as' => 'paycheck.show', 'uses' => 'PaychecksController@show']);
Route::post('paycheck', ['as' => 'paycheck.store', 'uses' => 'PaychecksController@store']);
Route::put('paycheck', ['as' => 'paycheck.update', 'uses' => 'PaychecksController@update']);
Route::delete('paycheck/{paycheck}', ['as' => 'paycheck.destroy', 'uses' => 'PaychecksController@destroy']);

Route::post('billpaycheck', ['as' => 'billpaycheck.store', 'uses' => 'BillPaycheckController@store']);
Route::put('billpaycheck', ['as' => 'billpaycheck.update', 'uses' => 'BillPaycheckController@update']);
Route::delete('billpaycheck/{bill}/{paycheck}', ['as' => 'billpaycheck.destroy', 'uses' => 'BillPaycheckController@destroy']);

Route::post('contributionpaycheck', ['as' => 'contributionpaycheck.store', 'uses' => 'ContributionPaycheckController@store']);
Route::put('contributionpaycheck', ['as' => 'contributionpaycheck.update', 'uses' => 'ContributionPaycheckController@update']);
Route::delete('contributionpaycheck/{contribution}/{paycheck}', ['as' => 'contributionpaycheck.destroy', 'uses' => 'ContributionPaycheckController@destroy']);

Route::get('user', ['as' => 'user.loggedin', 'uses' => 'UsersController@loggedin']);
