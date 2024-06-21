<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Bill;
use App\Paycheck;
use App\Http\Resources\BillPaycheckResource;

class BillPaycheckController extends Controller
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
     * Store a newly created bill-association in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /* validation */
        $request->validate([
            'bill_id' => 'required|integer',
            'paycheck_id' => 'required|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'due_on' => 'required|date',
            'paid_on' => 'nullable|date'
        ]);
        /* find models */
        $bill = Bill::findOrFail($request->input('bill_id'));
        $paycheck = Paycheck::with('income', 'bills')->findOrFail($request->input('paycheck_id'));
        /* authorization */
        $this->authorize('attachBill', [$paycheck, $bill]);
        /* save new association from request */
        $paycheck->bills()->attach($request->input('bill_id'), [
          'amount' => $request->input('amount'),
          'amount_project' => $request->input('amount_project'),
          'due_on' => $request->input('due_on'),
          'paid_on' => $request->input('paid_on')
        ]);

        /* return resource */
        return new BillPaycheckResource($paycheck->bills()->find($request->input('bill_id'))->pivot);
    }

    /**
     * Update a bill-paycheck association in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        /* validation */
        $request->validate([
            'bill_id' => 'required|integer',
            'paycheck_id' => 'required|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'due_on' => 'required|date',
            'paid_on' => 'nullable|date'
        ]);
        /* find models */
        $bill = Bill::findOrFail($request->input('bill_id'));
        $paycheck = Paycheck::with('income', 'bills')->findOrFail($request->input('paycheck_id'));
        /* authorization */
        $this->authorize('updatePivotBill', [$paycheck, $bill]);
        /* save association from request */
        $paycheck->bills()->updateExistingPivot($request->input('bill_id'), [
          'amount' => $request->input('amount'),
          'amount_project' => $request->input('amount_project'),
          'due_on' => $request->input('due_on'),
          'paid_on' => $request->input('paid_on')
        ]);

        /* return resource */
        return new BillPaycheckResource($paycheck->bills()->find($request->input('bill_id'))->pivot);
    }

    /**
     * Remove the specified bill-paycheck association from storage.
     *
     * @param  int  $billId
     * @param  int  $paycheckId
     * @return \Illuminate\Http\Response
     */
    public function destroy($billId, $paycheckId)
    {
        /* find models */
        $bill = Bill::findOrFail($billId);
        $paycheck = Paycheck::findOrFail($paycheckId);
        /* authorization */
        $this->authorize('detachBill', [$paycheck, $bill]);
        /* since the detach method returns null, the pivot model need to be pre-fetched for the return */
        $returnModel = $paycheck->bills()->find($billId)->pivot;
        /* delete association */
        $paycheck->bills()->detach($billId);

        /* return resource */
        return new BillPaycheckResource($returnModel);
    }
}
