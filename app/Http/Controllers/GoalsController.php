<?php

namespace App\Http\Controllers;

use App\Goal;
use App\Contribution;
use App\Http\Resources\GoalResource;
use Illuminate\Http\Request;
use DateTime;

class GoalsController extends Controller
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
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        /* authorization */
        $this->authorize('viewAny', Goal::class);
        /* extract options */
        $optionsArr = $this->extractOptions($request);
        /* fetch models */
        $goals = Goal::where('user_id', $request->user()->id)->with($optionsArr['with'])->get();
        /* return resource collection */
        return GoalResource::collection($goals);
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
            'name' => 'required|string|min:2|max:255',
            'amount' => 'required|numeric|between:0.01,99999.99',
            'initial_amount' => 'nullable|numeric|between:0.01,99999.99',
            'contributions' => 'bail|array|max:10',
            'contributions.*.amount' => 'required|numeric|between:0.01,99999.99',
            'contributions.*.day_due_on' => 'nullable|integer|between:1,31',
            'contributions.*.start_on' => 'required|date',
            'contributions.*.end_on' => 'required|date|after:contributions.*.start_on',
        ]);
        /* authorization */
        $goal = new Goal;
        $goal->user_id = $request->user()->id;
        $this->authorize('create', $goal);
        /* create new model from request */
        $goal->name = $request->input('name');
        $goal->amount = $request->input('amount');
        $goal->initial_amount = $request->input('initial_amount');
        /* save model */
        if($goal->save()) {
            foreach($request->input('contributions') as $contribution) {
                Contribution::create([
                  'goal_id' => $goal->id,
                  'amount' => $contribution['amount'],
                  'day_due_on' => $contribution['day_due_on'],
                  'start_on' => $contribution['start_on'],
                  'end_on' => $contribution['end_on'],
                ]);
            }
            $goal->load('contributions');
            /* return resource */
            return new GoalResource($goal);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Goal  $goal
     * @return \Illuminate\Http\Response
     */
    public function show(Goal $goal)
    {
        /* authorization */
        $this->authorize('view', $goal);
        /* return resource */
        return new GoalResource($goal);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Goal  $goal
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        /* validation */
        $request->validate([
            'id' => 'required|integer',
            'name' => 'nullable|string|min:2|max:255',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'initial_amount' => 'nullable|numeric|between:0.01,99999.99',
            'contributions' => 'bail|array|max:10',
            'contributions.*.id' => 'nullable|integer',
            'contributions.*.amount' => 'required|numeric|between:0.01,99999.99',
            'contributions.*.day_due_on' => 'nullable|integer|between:1,31',
            'contributions.*.start_on' => 'required|date',
            'contributions.*.end_on' => 'required|date|after:contributions.*.start_on',
        ]);
        $goal = Goal::with('contributions')->findOrFail($request->input('id'));
        // the contributions that were present in $goal, but are not present on the $request
        $diff = collect($goal->contributions->modelKeys())->diff(collect($request->input('contributions'))->pluck('id')->reject(function($value, $key) {
            return $value == null;
        }));
        Contribution::destroy($diff);
        /* authorization */
        $this->authorize('update', $goal);
        /* create new model from request */
        $goal->name = $request->input('name');
        $goal->amount = $request->input('amount');
        $goal->initial_amount = $request->input('initial_amount');
        foreach($request->input('contributions') as $contribution) {
            // check if contribution exists
            if(array_key_exists('id', $contribution) && $goal->contributions->contains($contribution['id'])) {
                // update if exists
                $oldContribution = Contribution::with('paychecks')->findOrFail($contribution['id']);
                $oldContribution->amount = $contribution['amount'];
                $oldContribution->day_due_on = $contribution['day_due_on'];
                $oldContribution->start_on = $contribution['start_on'];
                $oldContribution->end_on = $contribution['end_on'];
                $paychecksToRemove = [];
                $oldContributionStartOn = new DateTime((new DateTime($oldContribution->start_on))->format('Y-m')."-01");
                $oldContributionEndOn = new DateTime((new DateTime($oldContribution->end_on))->format('Y-m-t'));
                foreach($oldContribution->paychecks as $paycheck) {
                  if($oldContributionStartOn > new DateTime($paycheck->paid_on) || $oldContributionEndOn < new DateTime($paycheck->paid_on)) {
                    $paychecksToRemove[] = $paycheck->id;
                  }
                }
                $oldContribution->paychecks()->detach($paychecksToRemove);
                $oldContribution->save();
            } else {
                // or else add it
                Contribution::create([
                  'goal_id' => $goal->id,
                  'amount' => $contribution['amount'],
                  'day_due_on' => $contribution['day_due_on'],
                  'start_on' => $contribution['start_on'],
                  'end_on' => $contribution['end_on'],
                ]);
            }
        }
        $contributionsInput = collect($request->input('contributions'))->pluck('id');
        $goal->load('contributions');
        /* save model */
        if($goal->save()) {
            /* return resource */
            return new GoalResource($goal);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Goal  $goal
     * @return \Illuminate\Http\Response
     */
    public function destroy(Goal $goal)
    {
        /* authorization */
        $this->authorize('delete', $goal);
        /* delete model */
        if($goal->delete()) {
            /* return resource */
            return new GoalResource($goal);
        }
    }
}
