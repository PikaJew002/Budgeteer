<?php

namespace App\Http\Controllers;

use App\Goal;
use App\Contribution;
use App\Http\Resources\ContributionResource;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use DateTime;

class ContributionsController extends Controller
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
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        /* authorization */
        $this->authorize('viewAny', Contribution::class);
        /* extract options */
        $optionsArr = $this->extractOptions($request);
        /* fetch models */
        $contributions = Contribution::whereHas('goal', function(Builder $query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->with($optionsArr['with'])->get();
        /* return resource collection */
        return ContributionResource::collection($contributions);
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
            'goal_id' => 'required|integer',
            'amount' => 'required|numeric|between:0.01,99999.99',
            'day_due_on' => 'nullable|integer|between:1,31',
            'start_on' => 'required|date',
            'end_on' => 'required|date|after:start_on',
        ]);
        /* authorization */
        $contribution = new Contribution;
        $contribution->goal_id = $request->input('goal_id');
        $this->authorize('create', $contribution);
        /* create new model from request */
        $contribution->amount = $request->input('amount');
        $contribution->day_due_on = $request->input('day_due_on');
        $contribution->start_on = $request->input('start_on');
        $contribution->end_on = $request->input('end_on');
        /* save model */
        if($contribution->save()) {
            /* return resource */
            return new ContributionResource($contribution);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Contribution  $contribution
     * @return \Illuminate\Http\Response
     */
    public function show(Contribution $contribution)
    {
        /* authorization */
        $this->authorize('view', $contribution);
        /* return resource */
        return new ContributionResource($contribution);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        /* validation */
        $request->validate([
            'id' => 'required|integer',
            'goal_id' => 'nullable|integer',
            'amount' => 'required|numeric|between:0.01,99999.99',
            'day_due_on' => 'nullable|integer|between:1,31',
            'start_on' => 'required|date',
            'end_on' => 'required|date|after:start_on',
        ]);
        $contribution = Contribution::with('goal')->findOrFail($request->input('id'));
        /* authorization */
        $this->authorize('update', $contribution);
        /* create new model from request */
        $contribution->amount = $request->input('amount');
        $contribution->day_due_on = $request->input('day_due_on');
        $contribution->start_on = $request->input('start_on');
        $contribution->end_on = $request->input('end_on');
        /* save model */
        if($contribution->save()) {
            /* return resource */
            return new ContributionResource($contribution);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Contribution  $contribution
     * @return \Illuminate\Http\Response
     */
    public function destroy(Contribution $contribution)
    {
        /* authorization */
        $this->authorize('delete', $contribution);
        /* delete model */
        if($contribution->delete()) {
            /* return resource */
            return new ContributionResource($contribution);
        }
    }
}
