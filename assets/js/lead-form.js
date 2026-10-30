(function () {
  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function getSelectedIsd(form) {
    const select = form.querySelector(".my_country_name");
    const option = select?.selectedOptions?.[0];
    const code = option?.getAttribute("data-country_code") || "91";
    return code ? `+${String(code).replace(/^\+/, "")}` : "+91";
  }

  function getEnquiryType(form) {
    const popup = document.getElementById("quotePopup");
    const popupTitle = document.getElementById("quoteTitle");
    if (popup && popup.contains(form) && popupTitle) {
      return popupTitle.textContent.trim();
    }

    const inlineTitle = form.querySelector(".quoteTitle");
    return inlineTitle ? inlineTitle.textContent.trim() : "Website enquiry";
  }

  function clearFormError(form) {
    form.querySelector(".form-error")?.remove();
  }

  function showFormError(form, message) {
    clearFormError(form);
    const errorEl = document.createElement("p");
    errorEl.className = "form-error";
    errorEl.setAttribute("role", "alert");
    errorEl.textContent = message;

    const submitBtn = form.querySelector(".quoteSubmit");
    if (submitBtn) {
      submitBtn.insertAdjacentElement("afterend", errorEl);
    } else {
      form.appendChild(errorEl);
    }
  }

  function setSubmitting(form, isSubmitting) {
    const submitBtn = form.querySelector(".quoteSubmit");
    if (!submitBtn) return;

    submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      submitBtn.dataset.originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Submitting...";
    } else if (submitBtn.dataset.originalLabel) {
      submitBtn.textContent = submitBtn.dataset.originalLabel;
    }
  }

  function buildPayload(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.phone = digitsOnly(data.phone);
    data.isd = getSelectedIsd(form);
    data.enquiryType = getEnquiryType(form);
    data.referralURL = window.location.href;

    if (!data.projectName) {
      data.projectName = "Adani 9 PBR Seawoods";
    }

    return data;
  }

  async function submitLead(form) {
    const payload = buildPayload(form);
    const response = await fetch("submit.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    // Success ONLY when the server explicitly confirms the lead was saved.
    if (response.ok && result && result.ok === true) {
      return true;
    }

    throw new Error(
      (result && result.message) ||
        "Unable to submit right now. Please call 8828238703."
    );
  }

  function bindLeadForm(form) {
    if (form.dataset.leadBound === "1") return;
    form.dataset.leadBound = "1";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormError(form);

      if (form.dataset.submitting === "1") return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      form.dataset.submitting = "1";
      setSubmitting(form, true);

      try {
        await submitLead(form);
        if (typeof closeQuotePopup === "function") {
          closeQuotePopup();
        }
        window.location.assign("thank-you.html");
      } catch (error) {
        showFormError(
          form,
          error instanceof Error
            ? error.message
            : "Unable to submit right now. Please call 8828238703."
        );
        form.dataset.submitting = "0";
        setSubmitting(form, false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".quoteForm").forEach(bindLeadForm);
  });
})();
