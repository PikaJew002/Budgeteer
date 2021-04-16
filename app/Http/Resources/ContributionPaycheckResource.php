<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ContributionPaycheckResource extends JsonResource
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
            'contribution_id' => $this->contribution_id,
            'paycheck_id' => $this->paycheck_id,
            'amount' => $this->amount,
            'amount_project' => $this->amount_project,
            'due_on' => $this->due_on,
            'paid_on' => $this->paid_on,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
