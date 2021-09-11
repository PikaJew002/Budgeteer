<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\PaycheckResource;
use App\Http\Resources\BillPaycheckResource;

class BillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'paychecks' => PaycheckResource::collection($this->whenLoaded('paychecks')),
            'paycheck' => $this->whenPivotLoaded('bill_paycheck', function() {
              return new BillPaycheckResource($this->pivot);
            }),
            'name' => $this->name,
            'amount' => $this->amount,
            'day_due_on' => $this->day_due_on,
            'start_on' => $this->start_on,
            'end_on' => $this->end_on,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
