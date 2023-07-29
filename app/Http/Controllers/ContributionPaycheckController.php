<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Contribution;
use App\Paycheck;
use App\Http\Resources\ContributionResource;
use App\Http\Resources\PaycheckResource;
use App\Http\Resources\ContributionPaycheckResource;

class ContributionPaycheckController extends Controller
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
     * Store a newly created contribution-association in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /* validation */
        $request->validate([
            'contribution_id' => 'required|integer',
            'paycheck_id' => 'required|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'due_on' => 'required|date',
            'paid_on' => 'nullable|date',
        ]);
        /* find models */
        $contribution = Contribution::with('goal')->findOrFail($request->input('contribution_id'));
        $paycheck = Paycheck::with(['income', 'contributions'])->findOrFail($request->input('paycheck_id'));
        /* authorization */
        $this->authorize('attachContribution', [$paycheck, $contribution]);
        /* save new association from request */
        $paycheck->contributions()->attach($request->input('contribution_id'), [
          'amount' => $request->input('amount'),
          'amount_project' => $request->input('amount_project'),
          'due_on' => $request->input('due_on'),
          'paid_on' => $request->input('paid_on'),
        ]);

        /* return resource */
        return new ContributionPaycheckResource($paycheck->contributions()->find($request->input('contribution_id'))->pivot);
    }

    /**
     * Update a contribution-paycheck association in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        /* validation */
        $request->validate([
            'contribution_id' => 'required|integer',
            'paycheck_id' => 'required|integer',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'amount_project' => 'nullable|numeric|between:0.01,99999.99',
            'due_on' => 'required|date',
            'paid_on' => 'nullable|date',
        ]);
        /* find models */
        $contribution = Contribution::findOrFail($request->input('contribution_id'));
        $paycheck = Paycheck::with(['income', 'contributions'])->findOrFail($request->input('paycheck_id'));
        /* authorization */
        $this->authorize('updatePivotContribution', [$paycheck, $contribution]);
        /* save association from request */
        $paycheck->contributions()->updateExistingPivot($request->input('contribution_id'), [
          'amount' => $request->input('amount'),
          'amount_project' => $request->input('amount_project'),
          'due_on' => $request->input('due_on'),
          'paid_on' => $request->input('paid_on'),
        ]);

        /* return resource */
        return new ContributionPaycheckResource($paycheck->contributions()->find($request->input('contribution_id'))->pivot);
    }

    /**
     * Remove the specified contribution-paycheck association from storage.
     *
     * @param  int  $contributionId
     * @param  int  $paycheckId
     * @return \Illuminate\Http\Response
     */
    public function destroy($contributionId, $paycheckId)
    {
        /* find models */
        $contribution = Contribution::findOrFail($contributionId);
        $paycheck = Paycheck::findOrFail($paycheckId);
        /* authorization */
        $this->authorize('detachContribution', [$paycheck, $contribution]);
        /* since the detach method returns null, the pivot model need to be pre-fetched for the return */
        $returnModel = $paycheck->contributions()->find($contributionId)->pivot;
        /* delete association */
        $paycheck->contributions()->detach($contributionId);

        /* return resource */
        return new ContributionPaycheckResource($returnModel);
    }
}
