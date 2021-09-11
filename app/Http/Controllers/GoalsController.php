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
        ]);
        $goal = Goal::findOrFail($request->input('id'));
        /* authorization */
        $this->authorize('update', $goal);
        /* create new model from request */
        $goal->name = $request->input('name');
        $goal->amount = $request->input('amount');
        $goal->initial_amount = $request->input('initial_amount');
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
