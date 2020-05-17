<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\GoalResource;

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
            'amount' => $this->amount,
            'start_on' => $this->start_on,
            'end_on' => $this->end_on,
        ];
    }
}
