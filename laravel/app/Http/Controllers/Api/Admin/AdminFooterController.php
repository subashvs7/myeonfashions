<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FooterSection;
use App\Models\FooterLink;
use Illuminate\Http\Request;

class AdminFooterController extends Controller
{
    public function sections()
    {
        return response()->json([
            'success' => true,
            'data'    => FooterSection::with('links')->orderBy('position')->get(),
        ]);
    }

    public function createSection(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:80',
            'position'  => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);
        return response()->json(['success' => true, 'data' => FooterSection::create($data)], 201);
    }

    public function updateSection(Request $request, int $id)
    {
        $section = FooterSection::findOrFail($id);
        $section->update($request->validate([
            'title'     => 'sometimes|string|max:80',
            'position'  => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]));
        return response()->json(['success' => true, 'data' => $section]);
    }

    public function deleteSection(int $id)
    {
        FooterSection::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function createLink(Request $request, int $sectionId)
    {
        FooterSection::findOrFail($sectionId);
        $data = $request->validate([
            'label'           => 'required|string|max:80',
            'url'             => 'required|string|max:255',
            'open_in_new_tab' => 'sometimes|boolean',
            'position'        => 'sometimes|integer',
            'is_active'       => 'sometimes|boolean',
        ]);
        $data['footer_section_id'] = $sectionId;
        return response()->json(['success' => true, 'data' => FooterLink::create($data)], 201);
    }

    public function updateLink(Request $request, int $linkId)
    {
        $link = FooterLink::findOrFail($linkId);
        $link->update($request->validate([
            'label'           => 'sometimes|string|max:80',
            'url'             => 'sometimes|string|max:255',
            'open_in_new_tab' => 'sometimes|boolean',
            'position'        => 'sometimes|integer',
            'is_active'       => 'sometimes|boolean',
        ]));
        return response()->json(['success' => true, 'data' => $link]);
    }

    public function deleteLink(int $linkId)
    {
        FooterLink::findOrFail($linkId)->delete();
        return response()->json(['success' => true]);
    }
}
