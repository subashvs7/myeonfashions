<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'         => 'sometimes|string|max:50',
            'full_name'     => 'required|string|max:100',
            'phone'         => 'required|string|max:15',
            'address_line1' => 'required|string',
            'address_line2' => 'nullable|string',
            'city'          => 'required|string',
            'state'         => 'required|string',
            'pincode'       => 'required|string|max:10',
            'is_default'    => 'sometimes|boolean',
        ]);

        if (!Address::where('user_id', $request->user()->id)->exists()) {
            $data['is_default'] = true;
        } elseif (!empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create([...$data, 'user_id' => $request->user()->id]);
        return response()->json(['success' => true, 'data' => $address], 201);
    }

    public function show(Request $request, int $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['success' => true, 'data' => $address]);
    }

    public function update(Request $request, int $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $data    = $request->validate([
            'label'         => 'sometimes|string',
            'full_name'     => 'sometimes|string',
            'phone'         => 'sometimes|string',
            'address_line1' => 'sometimes|string',
            'city'          => 'sometimes|string',
            'state'         => 'sometimes|string',
            'pincode'       => 'sometimes|string',
        ]);
        $address->update($data);
        return response()->json(['success' => true, 'data' => $address]);
    }

    public function destroy(Request $request, int $id)
    {
        Address::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Address deleted']);
    }

    public function setDefault(Request $request, int $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $address->setAsDefault();
        return response()->json(['success' => true, 'data' => $address]);
    }
}
