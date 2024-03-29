<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\GoalResource;
use App\Http\Resources\PaycheckResource;
use App\Http\Resources\ContributionPaycheckResource;

class ContributionResource extends JsonResource
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
            'goal_id' => $this->goal_id,
            'goal' => new GoalResource($this->whenLoaded('goal')),
            'paychecks' => PaycheckResource::collection($this->whenLoaded('paychecks')),
            'paycheck' => $this->whenPivotLoaded('contribution_paycheck', function() {
              return new ContributionPaycheckResource($this->pivot);
            }),
            'amount' => $this->amount,
            'day_due_on' => $this->day_due_on,
            'start_on' => $this->start_on,
            'end_on' => $this->end_on,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
