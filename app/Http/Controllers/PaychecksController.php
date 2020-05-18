<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use App\Paycheck;
use App\Bill;
use App\Income;
use App\Notification;
use App\Http\Resources\PaycheckResource;
use DateTime;

class PaychecksController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        /* authorization */
        $this->authorize('index', Paycheck::class);
        /* extract options */
        $optionsArr = $this->extractOptions($request);
        /* find models with options */
        $paychecks = Paycheck::whereHas('income', function(Builder $query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->with($optionsArr['with'])->get();
        /* return resource collection */
        return PaycheckResource::collection($paychecks);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /* validation */
        $request->validate([
            'income_id' => 'required|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'notify_when_paid' => 'nullable|boolean',
            'paid_on' => 'required|date'
        ]);
        /* find model */
        $income = Income::findOrFail($request->input('income_id'));
        /* authorization */
        $paycheck = new Paycheck;
        $paycheck->income_id = $request->input('income_id');
        $this->authorize('create', $paycheck);
        /* create new model from request */
        $paycheck->amount = $request->input('amount');
        $paycheck->amount_project = $request->input('amount_project');
        $paycheck->notify_when_paid = $request->input('notify_when_paid');
        $paycheck->paid_on = $request->input('paid_on');
        /* save model */
        if($paycheck->save()) {
            if($paycheck->notify_when_paid) {
                /* make new scheduled notification */
                $notification = new Notification;
                $notification->user_id = $paycheck->income->user_id;
                $notification->notifiable_id = $paycheck->id;
                $notification->notifiable_type = "paychecks";
                $notification->type = "PaycheckPaid";
                $notification->notified_on = $paycheck->paid_on;
                $notification->save();
            }
            /* return resource */
            return new PaycheckResource($paycheck);
        }
    }

    /**
     * Update a resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        /* validation */
        $request->validate([
            'id' => 'required|integer',
            'income_id' => 'nullable|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'notify_when_paid' => 'nullable|boolean',
            'paid_on' => 'nullable|date'
        ]);
        /* find model */
        $paycheck = Paycheck::with(['income', 'notifications'])->findOrFail($request->input('id'));
        $paycheck->income_id = $request->input('income_id');
        /* authorization */
        $this->authorize('update', $paycheck);
        /* update model from request */ // only amount and amount_project
        $paycheck->amount = $request->input('amount');
        $paycheck->amount_project = $request->input('amount_project');
        /* get today as just a date (no time) */
        $now = new DateTime;
        $nowDay = new DateTime($now->format('Y-m-d'));
        if(!$paycheck->notify_when_paid) { // did not have a notification when paid scheduled or sent
            if($request->input('notify_when_paid')) { // wants to add a notification
                // does not have a notification scheduled
                if($paycheck->notifications->isEmpty()) {
                    // new paid_on is today or after
                    if(new DateTime($request->input('paid_on')) >= $nowDay) {
                        $paycheck->notify_when_paid = true;
                        /* make new notification */
                        $notification = new Notification;
                        $notification->user_id = $paycheck->income->user_id;
                        $notification->notifiable_id = $paycheck->id;
                        $notification->notifiable_type = "paychecks";
                        $notification->type = "PaycheckPaid";
                        $notification->notified_on = $request->input('paid_on');
                        $notification->save();
                    }
                }
            } // does not want to add a notification, do nothing, continue
        } else { // does have a notification when paid scheduled
            if(!$request->input('notify_when_paid')) { // wants to remove a notification
                // check that there are is a scheduled notification
                if($paycheck->notified_at == null && $paycheck->notifications->isNotEmpty()) {
                    Notification::destroy($paycheck->notifications->modelKeys());
                }
                $paycheck->notify_when_paid = false;
            } else { // does not want to remove notification
                if($paycheck->notified_at == null && $paycheck->notifications->isNotEmpty()) { // check if notification not already sent
                    if(new DateTime($request->input('paid_on')) >= $nowDay) { // new paid_on is today or after
                        // update notification notified_on with new paid_on
                        $notification = $paycheck->notifications->first();
                        $notification->notified_on = $request->input('paid_on');
                        $notification->save();
                    } else { // new paid_on is before today, delete notification, will never be sent
                        Notification::destroy($paycheck->notifications->modelKeys());
                        $paycheck->notify_when_paid = false;
                    }
                } else {
                    if($request->input('paid_on') != $paycheck->paid_on && new DateTime($request->input('paid_on')) >= $nowDay) { // new paid_on is today or after
                        $paycheck->notified_at = null;
                        /* make new notification */
                        $notification = new Notification;
                        $notification->user_id = $paycheck->income->user_id;
                        $notification->notifiable_id = $paycheck->id;
                        $notification->notifiable_type = "paychecks";
                        $notification->type = "PaycheckPaid";
                        $notification->notified_on = $request->input('paid_on');
                        $notification->save();
                    }
                }
            }
        }
        /* update paid_on */
        $paycheck->paid_on = $request->input('paid_on');
        /* save model */
        if($paycheck->save()) {
            /* return resource */
            return new PaycheckResource($paycheck);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        /* find model */
        $paycheck = Paycheck::with('income')->findOrFail($id);
        /* authorization */
        $this->authorize('view', $paycheck);
        /* return resource */
        return new PaycheckResource($paycheck);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        /* find model */
        $paycheck = Paycheck::with(['income', 'notifications'])->findOrFail($id);
        /* authorization */
        $this->authorize('delete', $paycheck);
        /* check for notifications */
        if($paycheck->notifications->isNotEmpty()) {
            /* if notifications exist, delete them */
            Notification::destroy($paycheck->notifications->modelKeys());
        }
        /* delete model */
        if($paycheck->delete()) {
            /* return resource */
            return new PaycheckResource($paycheck);
        }
    }
}
