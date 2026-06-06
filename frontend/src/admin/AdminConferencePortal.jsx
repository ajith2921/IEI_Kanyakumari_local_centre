import { useState, useEffect } from "react";
import ResourceManager from "./ResourceManager";
import { adminApi, publicApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminConferencePortal() {
  const [activeConference, setActiveConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("dates");

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await publicApi.getActiveConference();
        setActiveConference(res.data);
      } catch (err) {
        console.error("Failed to fetch active conference", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  if (!activeConference) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <h2 className="mb-2 text-xl font-bold">No Active Conference Found</h2>
        <p>Please set a conference as "active" in the main Conference management tab before managing its portal data.</p>
      </div>
    );
  }

  const cid = activeConference.id;

  const tabs = [
    { id: "dates", label: "Important Dates" },
    { id: "speakers", label: "Speakers" },
    { id: "committees", label: "Committees" },
    { id: "schedule", label: "Schedule" },
    { id: "sponsors", label: "Sponsors" },
    { id: "venue", label: "Venue" },
    { id: "gallery", label: "Gallery" },
    { id: "downloads", label: "Downloads" },
    { id: "faq", label: "FAQ" },
    { id: "tracks", label: "Tracks" },
    { id: "registrations", label: "Registrations" },
    { id: "submissions", label: "Submissions" },
  ];

  // Resource Manager Configs
  const configs = {
    dates: {
      title: "Important Dates",
      fields: [
        { name: "label", label: "Event Label", required: true },
        { name: "date_value", label: "Date String (e.g. 15th October 2026)", required: true },
        { name: "is_extended", label: "Is Extended?", type: "checkbox" },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ],
    },
    speakers: {
      title: "Speakers",
      fields: [
        { name: "name", label: "Name", required: true },
        { name: "designation", label: "Designation" },
        { name: "organization", label: "Organization" },
        { name: "country", label: "Country" },
        { name: "bio", label: "Bio", type: "textarea", rows: 3 },
        { name: "speaker_type", label: "Speaker Type", type: "select", options: [{label: "Keynote", value: "keynote"}, {label: "Invited", value: "invited"}], default: "keynote" },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ],
      imageUploadConfig: { enabled: true, fieldName: "image_url", fileFieldName: "image_url" }
    },
    committees: {
      title: "Committees",
      fields: [
        { name: "member_name", label: "Member Name", required: true },
        { name: "designation", label: "Designation" },
        { name: "organization", label: "Organization" },
        { name: "role", label: "Role (e.g. General Chair, Technical Committee)", required: true },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ]
    },
    schedule: {
      title: "Program Schedule",
      fields: [
        { name: "day_label", label: "Day Label (e.g. Oct 20)", required: true },
        { name: "start_time", label: "Start Time" },
        { name: "end_time", label: "End Time" },
        { name: "session_title", label: "Session Title", required: true },
        { name: "speaker_name", label: "Speaker Name (Optional)" },
        { name: "session_type", label: "Type", type: "select", options: [{label: "Session", value: "session"}, {label: "Keynote", value: "keynote"}, {label: "Break", value: "break"}] },
        { name: "venue_room", label: "Room/Hall" },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ]
    },
    sponsors: {
      title: "Sponsors",
      fields: [
        { name: "name", label: "Sponsor Name", required: true },
        { name: "website_url", label: "Website URL" },
        { name: "category", label: "Category", type: "select", options: [{label: "Title Sponsor", value: "Title Sponsor"}, {label: "Platinum Sponsor", value: "Platinum Sponsor"}, {label: "Gold Sponsor", value: "Gold Sponsor"}, {label: "Silver Sponsor", value: "Silver Sponsor"}, {label: "Exhibitor", value: "Exhibitor"}, {label: "Academic Partner", value: "Academic Partner"}] },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ],
      imageUploadConfig: { enabled: true, fieldName: "logo_url", fileFieldName: "logo_url" }
    },
    venue: {
      title: "Venue & Accommodation",
      fields: [
        { name: "venue_name", label: "Venue Name", required: true },
        { name: "address", label: "Address", type: "textarea", rows: 2 },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "pincode", label: "Pincode" },
        { name: "map_embed_url", label: "Google Maps Embed URL" },
        { name: "directions", label: "Directions", type: "textarea", rows: 3 },
        { name: "nearby_hotels", label: "Nearby Hotels", type: "textarea", rows: 3 },
      ],
      imageUploadConfig: { enabled: true, fieldName: "image_url", fileFieldName: "image_url" }
    },
    gallery: {
      title: "Gallery",
      fields: [
        { name: "title", label: "Image Title / Caption" },
        { name: "album_label", label: "Album Label", default: "Conference Highlights" },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ],
      imageUploadConfig: { enabled: true, fieldName: "image_url", fileFieldName: "image_url", guideline: "Recommended size: 800x600 (or 400x300 minimum)" }
    },
    downloads: {
      title: "Downloads",
      fields: [
        { name: "title", label: "Document Title", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 2 },
        { name: "file_type", label: "File Type (e.g. PDF, DOCX)" },
        { name: "category", label: "Category" },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ]
      // file upload support needed in ResourceManager
    },
    faq: {
      title: "FAQ",
      fields: [
        { name: "question", label: "Question", required: true },
        { name: "answer", label: "Answer", type: "textarea", rows: 4, required: true },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ]
    },
    tracks: {
      title: "Call for Papers Tracks",
      fields: [
        { name: "track_name", label: "Track Name", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
      ]
    },
    registrations: {
      title: "Registrations",
      fields: [
        { name: "full_name", label: "Full Name", required: true },
        { name: "email", label: "Email", required: true },
        { name: "phone", label: "Phone" },
        { name: "organization", label: "Organization" },
        { name: "category", label: "Category" },
        { name: "status", label: "Status", type: "select", options: [{label: "Pending", value: "pending"}, {label: "Approved", value: "approved"}, {label: "Rejected", value: "rejected"}] },
        { name: "payment_ref", label: "Payment Reference" },
        { name: "remarks", label: "Admin Remarks", type: "textarea" },
      ]
    },
    submissions: {
      title: "Paper Submissions",
      fields: [
        { name: "paper_title", label: "Paper Title", required: true },
        { name: "author_name", label: "Author Name", required: true },
        { name: "email", label: "Email", required: true },
        { name: "track", label: "Track" },
        { name: "status", label: "Status", type: "select", options: [{label: "Submitted", value: "submitted"}, {label: "Under Review", value: "under_review"}, {label: "Accepted", value: "accepted"}, {label: "Rejected", value: "rejected"}] },
        { name: "pdf_url", label: "PDF Document URL" },
        { name: "reviewer_comments", label: "Reviewer Comments", type: "textarea", rows: 4 },
      ]
    }
  };

  const activeConfig = configs[currentTab];

  // Helper API wrappers that automatically inject conference_id into POST/PUT payload
  const createItemWrapper = async (payload) => {
    if (payload instanceof FormData) {
      payload.append("conference_id", cid);
    } else {
      payload.conference_id = cid;
    }
    return await adminApi.conferencePortal.create(currentTab, payload);
  };

  const updateItemWrapper = async (id, payload) => {
    if (payload instanceof FormData) {
      payload.append("conference_id", cid);
    } else {
      payload.conference_id = cid;
    }
    return await adminApi.conferencePortal.update(currentTab, id, payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conference Portal Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Currently managing: <span className="font-semibold text-emerald-700">{activeConference.short_title || activeConference.title}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white p-1 shadow-sm border border-slate-200">
        <nav className="flex min-w-max space-x-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <ResourceManager
          key={currentTab} // Force re-mount when tab changes
          title={activeConfig.title}
          fields={activeConfig.fields}
          fetchList={() => adminApi.conferencePortal.list(currentTab, cid)}
          createItem={createItemWrapper}
          updateItem={updateItemWrapper}
          deleteItem={(id) => adminApi.conferencePortal.remove(currentTab, id)}
          imageUploadConfig={activeConfig.imageUploadConfig}
        />
      </div>
    </div>
  );
}
