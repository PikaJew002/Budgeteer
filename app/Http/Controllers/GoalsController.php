<?php

namespace App\Http\Controllers;

use App\Goal;
use App\Http\Resources\GoalResource;
use Illuminate\Http\Request;

class GoalsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        /* authorization */
        $this->authorize('viewAny', Goal::class);
        /* fetch models */
        $goals = Goal::where('user_id', $request->user()->id)->get();
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
            'amount' => 'nullable|numeric|between:0.01,99999.99',
        ]);
        /* authorization */
        $goal = new Goal;
        $goal->user_id = $request->user()->id;
        $this->authorize('create', $goal);
        /* create new model from request */
        $goal->name = $request->input('name');
        $goal->amount = $request->input('amount');
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
    public function update(Request $request, Goal $goal)
    {
        /* validation */
        $request->validate([
            'name' => 'nullable|string|min:2|max:255',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
        ]);
        /* authorization */
        $this->authorize('update', $goal);
        /* create new model from request */
        $goal->name = $request->input('name');
        $goal->amount = $request->input('amount');
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
        $this->authorize('destroy', $goal);
        /* return resource */
        return new GoalResource($goal);
    }
}