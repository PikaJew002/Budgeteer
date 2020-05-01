@extends('layouts.app')

@section('content')
    <main class="py-2">
      <div class="container">
        <h2>User Verified!</h2>
        <p>
          The User {{ $user->name }} ({{ $user->email }}) was verified and has been notified.
        </p>
      </div>
    </main>
@endsection
