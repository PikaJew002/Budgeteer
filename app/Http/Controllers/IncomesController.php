<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Income;
use App\Http\Resources\IncomeResource;

class IncomesController extends Controller
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
        $this->authorize('viewAny', Income::class);
        /* extract options */
        $optionsArr = $this->extractOptions($request);
        /* find models with options */
        $incomes = Income::where('user_id', $request->user()->id)->with($optionsArr['with'])->get();
        /* return resource collection */
        return IncomeResource::collection($incomes);
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
            'name' => 'required|string'
        ]);
        /* authorization*/
        $income = new Income;
        $income->user_id = $request->user()->id;
        $this->authorize('create', $income);
        /* create new model from request */
        $income->name = $request->input('name');
        /* save new model */
        if($income->save()) {
            /* return resource */
            return new IncomeResource($income);
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
            'user_id' => 'required|integer',
            'name' => 'required|string'
        ]);
        /* find model */
        $income = Income::findOrFail($request->input('id'));
        /* authorization */
        $this->authorize('update', $income);
        /* update model from request */
        $income->name = $request->input('name');
        /* save model */
        if($income->save()) {
            /* return resource */
            return new IncomeResource($income);
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
        $income = Income::findOrFail($id);
        /* authorization */
        $this->authorize('view', $income);
        /* return resource */
        return new IncomeResource($income);
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
        $income = Income::findOrFail($id);
        /* authorization */
        $this->authorize('delete', $income);
        /* delete model */
        if($income->delete()) {
            /* return resource */
            return new IncomeResource($income);
        }
    }
}
