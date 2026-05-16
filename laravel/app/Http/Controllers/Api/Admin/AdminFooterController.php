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
        $sections = FooterSection::with(['links' => fn($q) => $q->orderBy('position')])
            ->orderBy('position')
            ->get();
        return response()->json(['success' => true, 'data' => $sections]);
    }

    public function createSection(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:100',
            'position'  => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        $section = FooterSection::create($data);
        return response()->json(['success' => true, 'data' => $section], 201);
    }

    public function updateSection(Request $request, $id)
    {
        $section = FooterSection::findOrFail($id);
        $data = $request->validate([
            'title'     => 'sometimes|nullable|string|max:100',
            'position'  => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|nullable|boolean',
        ]);
        $section->update($data);
        return response()->json(['success' => true, 'data' => $section]);
    }

    public function deleteSection($id)
    {
        FooterSection::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function createLink(Request $request, $sectionId)
    {
        FooterSection::findOrFail($sectionId);
        $data = $request->validate([
            'label'           => 'required|string|max:100',
            'url'             => 'required|string|max:255',
            'open_in_new_tab' => 'nullable|boolean',
            'position'        => 'nullable|integer',
            'is_active'       => 'nullable|boolean',
        ]);
        $link = FooterLink::create(['footer_section_id' => $sectionId] + $data);
        return response()->json(['success' => true, 'data' => $link], 201);
    }

    public function updateLink(Request $request, $linkId)
    {
        $link = FooterLink::findOrFail($linkId);
        $data = $request->validate([
            'label'           => 'sometimes|nullable|string|max:100',
            'url'             => 'sometimes|nullable|string|max:255',
            'open_in_new_tab' => 'sometimes|nullable|boolean',
            'position'        => 'sometimes|nullable|integer',
            'is_active'       => 'sometimes|nullable|boolean',
        ]);
        $link->update($data);
        return response()->json(['success' => true, 'data' => $link]);
    }

    public function deleteLink($linkId)
    {
        FooterLink::findOrFail($linkId)->delete();
        return response()->json(['success' => true]);
    }
}
