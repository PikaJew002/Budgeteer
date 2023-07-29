<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Bill;
use App\Http\Resources\BillResource;

class BillsController extends Controller
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        /* authorization */
        $this->authorize('viewAny', Bill::class);
        /* extract options */
        $optionsArr = $this->extractOptions($request);
        /* find models with options */
        $bills = Bill::where('user_id', $request->user()->id)->with($optionsArr['with'])->get();
        if(!empty($optionsArr['filter_date'])) {
            $filter_dateArr = $optionsArr['filter_date'];
            $bills = $bills->filter(function($model, $key) use ($filter_dateArr) {
                foreach($filter_dateArr as $filter) {
                    $comparisionFunction = $filter['comparison'];
                    $valueArr = explode("-", $filter['comparison_value']);
                    $carbonValue = Carbon::create($valueArr[0], $valueArr[1], $valueArr[2]);
                    $carbonModel = $model->{$filter['model_attribute']};
                    if(!($carbonValue->$comparisionFunction($carbonModel))) {
                        return false;
                    }
                }
                return true;
            });
        }
        /* return resource collection */
        return BillResource::collection($bills);
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
            'name' => 'required|string',
            'amount' => 'required|numeric|between:0.01,99999.99',
            'day_due_on' => 'nullable|integer|between:1,31',
            'start_on' => 'bail|required|date',
            'end_on' => 'required|date|after:'.$request->input('start_on')
        ]);
        /* authorization */
        $bill = new Bill;
        $bill->user_id = $request->user()->id;
        $this->authorize('create', $bill);
        /* create new model from request */
        $bill->name = $request->input('name');
        $bill->amount = $request->input('amount');
        $bill->day_due_on = $request->input('day_due_on');
        $bill->start_on = $request->input('start_on');
        $bill->end_on = $request->input('end_on');
        /* save new model */
        if($bill->save()) {
            /* return resource */
            return new BillResource($bill);
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
            'user_id' => 'nullable|integer',
            'name' => 'nullable|string',
            'amount' => 'nullable|numeric|between:0.01,99999.99',
            'day_due_on' => 'nullable|integer',
            'start_on' => 'required|date',
            'end_on' => 'required|date|after:'.$request->input('start_on')
        ]);
        /* find model */
        $bill = Bill::findOrFail($request->input('id'));
        /* authorization */
        $this->authorize('update', $bill);
        /* update model from request */
        $bill->name = $request->input('name');
        $bill->amount = $request->input('amount');
        $bill->day_due_on = $request->input('day_due_on');
        $bill->start_on = $request->input('start_on');
        $bill->end_on = $request->input('end_on');
        /* save model */
        if($bill->save()) {
            /* return resource */
            return new BillResource($bill);
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
        $bill = Bill::findOrFail($id);
        /* authorization */
        $this->authorize('view', $bill);
        /* return resource */
        return new BillResource($bill);
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
        $bill = Bill::findOrFail($id);
        /* authorization */
        $this->authorize('delete', $bill);
        /* delete model */
        if($bill->delete()) {
            /* return resource */
            return new BillResource($bill);
        }
    }
}
