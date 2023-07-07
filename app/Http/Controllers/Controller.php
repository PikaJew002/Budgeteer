<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public static function extractOptions(Request $request) {
        $withArr = ($request->has('with') && !empty($request->input('with'))) ? explode(':', $request->input('with')) : [];
        $filter_dateArrOfStrs = ($request->has('filter_date') && !empty($request->input('filter_date'))) ? explode(':', $request->input('filter_date')) : [];
        $filter_dateArr = [];
        foreach($filter_dateArrOfStrs as $dateCompareStr) {
            $compareArr = explode('|', $dateCompareStr);
            array_push($filter_dateArr, [
              'comparison' => $compareArr[0],
              'comparison_value' => $compareArr[1],
              'model_attribute' => $compareArr[2]
            ]);
        }
        return [
          'with' => $withArr,
          'filter_date' => $filter_dateArr
        ];
    }
}
