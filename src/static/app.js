document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML (bulleted list) or a friendly placeholder
        // Build participants section using DOM so we can attach delete handlers safely
        let participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';

        let title = document.createElement('h5');
        title.textContent = 'Participants';
        participantsSection.appendChild(title);

        if (details.participants && details.participants.length) {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          details.participants.forEach((p) => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = p;
            nameSpan.className = 'participant-name';

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'participant-delete';
            delBtn.title = 'Remove participant';
            delBtn.dataset.email = p;
            delBtn.textContent = '✕';

            li.appendChild(nameSpan);
            li.appendChild(delBtn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const pNo = document.createElement('p');
          pNo.className = 'no-participants';
          pNo.textContent = 'No participants yet.';
          participantsSection.appendChild(pNo);
        }

        activityCard.appendChild(document.createElement('h4')).textContent = name;
        const descP = document.createElement('p');
        descP.textContent = details.description;
        const schedP = document.createElement('p');
        schedP.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        const availP = document.createElement('p');
        availP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        activityCard.appendChild(descP);
        activityCard.appendChild(schedP);
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Attach delete handlers
        activityCard.querySelectorAll('.participant-delete').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const email = btn.dataset.email;
            if (!email) return;
            if (!confirm(`Remove ${email} from ${name}?`)) return;
            try {
              const res = await fetch(
                `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );
              const result = await res.json();
              if (res.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = 'success';
                // Refresh list
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
              }
              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 5000);
            } catch (err) {
              console.error('Error removing participant:', err);
              messageDiv.textContent = 'Failed to remove participant.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 5000);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the UI shows the new participant and updated availability
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
