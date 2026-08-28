const COMMENTS_API =
    "https://wegschachtel-comments-api.i-m-c-stummer.workers.dev";

function getClientId() {

    let clientId =
        localStorage.getItem(
            "wegschachtel-client-id"
        );

    if (!clientId) {

        clientId =
            crypto.randomUUID();

        localStorage.setItem(
            "wegschachtel-client-id",
            clientId
        );
    }

    return clientId;
}


const clientId =
    getClientId();


const commentForm =
    document.querySelector("#comment-form");

const commentName =
    document.querySelector("#comment-name");

const commentBody =
    document.querySelector("#comment-body");

const commentStatus =
    document.querySelector("#comment-status");

const commentsList =
    document.querySelector("#comments-list");


const commentParams =
    new URLSearchParams(window.location.search);

const commentEventSlug =
    commentParams.get("event");

async function toggleLike(
    commentId,
    currentlyLiked
) {

    const method =
        currentlyLiked
            ? "DELETE"
            : "POST";


    try {

        const response =
            await fetch(
                `${COMMENTS_API}/likes`,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        commentId:
                            commentId,

                        clientId:
                            clientId
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error
                || "Like konnte nicht gespeichert werden."
            );
        }


    } catch (error) {

        console.error(error);
    }
}
/* ========================================
   KOMMENTARE LADEN
   ======================================== */

async function loadComments() {

    if (!commentEventSlug) {
        return;
    }


    commentsList.innerHTML =
        `<p class="comments-loading">Kommentare werden geladen ...</p>`;


    try {

        const response =
            await fetch(
                `${COMMENTS_API}/comments?event=${encodeURIComponent(commentEventSlug)}&clientId=${encodeURIComponent(clientId)}`
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Kommentare konnten nicht geladen werden."
            );
        }


        renderComments(
            data.comments || []
        );


    } catch (error) {

        commentsList.innerHTML = `
            <p class="comment-error">
                Kommentare konnten nicht geladen werden.
            </p>
        `;

        console.error(error);
    }
}


/* ========================================
   KOMMENTARE DARSTELLEN
   ======================================== */

function renderComments(comments) {

    commentsList.innerHTML = "";


    const mainComments =
        comments.filter(
            comment => !comment.parent_id
        );


    if (mainComments.length === 0) {

        commentsList.innerHTML = `
            <p class="no-comments">
                Noch keine Kommentare.
            </p>
        `;

        return;
    }


    mainComments.forEach(comment => {

        const replies =
            comments.filter(
                reply =>
                    Number(reply.parent_id)
                    === Number(comment.id)
            );


        const article =
            createCommentElement(
                comment,
                replies
            );


        commentsList.appendChild(
            article
        );
    });
}


/* ========================================
   EINEN KOMMENTAR BAUEN
   ======================================== */

function createCommentElement(
    comment,
    replies
) {

    const article =
        document.createElement("article");

    article.className =
        "comment-item";


    const date =
        new Date(
            comment.created_at + "Z"
        );


    article.innerHTML = `
        <div class="comment-meta">

            <strong></strong>

            <span>
                ${formatCommentDate(date)}
            </span>

        </div>

        <p class="comment-text"></p>

        <div class="comment-actions">

            <button
                class="like-button"
                type="button">
            </button>

            <button
                class="reply-button"
                type="button">
                REPLY
            </button>

        </div>

        <div class="reply-form-container"></div>

        <div class="comment-replies"></div>
    `;


    article
        .querySelector("strong")
        .textContent =
        comment.name;


    article
        .querySelector(".comment-text")
        .textContent =
        comment.body;


    /* -------------------------
       LIKES
       ------------------------- */

    const likeButton =
        article.querySelector(
            ".like-button"
        );


    let liked =
        Number(comment.liked_by_client) === 1;


    let likeCount =
        Number(comment.like_count || 0);


    function updateLikeButton() {

        likeButton.textContent =
            `${liked ? "♥" : "♡"} ${likeCount}`;

    }


    updateLikeButton();


    likeButton.addEventListener(
        "click",
        async () => {

            try {

                await toggleLike(
                    comment.id,
                    liked
                );


                if (liked) {

                    liked = false;

                    likeCount =
                        Math.max(
                            0,
                            likeCount - 1
                        );

                } else {

                    liked = true;

                    likeCount++;

                }


                updateLikeButton();


            } catch (error) {

                console.error(error);

            }

        }
    );


    /* -------------------------
       ANTWORTEN
       ------------------------- */

    const repliesContainer =
        article.querySelector(
            ".comment-replies"
        );


    replies.forEach(reply => {

        const replyElement =
            document.createElement("div");

        replyElement.className =
            "comment-reply";


        const replyDate =
            new Date(
                reply.created_at + "Z"
            );


        replyElement.innerHTML = `
            <div class="comment-meta">

                <strong></strong>

                <span>
                    ${formatCommentDate(replyDate)}
                </span>

            </div>

            <p></p>
        `;


        replyElement
            .querySelector("strong")
            .textContent =
            reply.name;


        replyElement
            .querySelector("p")
            .textContent =
            reply.body;


        repliesContainer.appendChild(
            replyElement
        );
    });


    /* -------------------------
       REPLY BUTTON
       ------------------------- */

    const replyButton =
        article.querySelector(
            ".reply-button"
        );


    const replyFormContainer =
        article.querySelector(
            ".reply-form-container"
        );


    replyButton.addEventListener(
        "click",
        () => {

            showReplyForm(
                comment.id,
                replyFormContainer
            );

        }
    );


    return article;
}



/* ========================================
   ANTWORTFORMULAR
   ======================================== */

function showReplyForm(
    parentId,
    container
) {

    if (
        container.querySelector(
            ".reply-form"
        )
    ) {
        return;
    }


    const form =
        document.createElement("form");


    form.className =
        "reply-form";


    form.innerHTML = `
        <input
            type="text"
            maxlength="30"
            placeholder="Dein Name"
            required
        >

        <textarea
            maxlength="500"
            placeholder="Antwort schreiben ..."
            required
        ></textarea>

        <div>
            <button type="submit">
                REPLY →
            </button>
        </div>
    `;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                form
                .querySelector("input")
                .value
                .trim();


            const body =
                form
                .querySelector("textarea")
                .value
                .trim();


            if (!name || !body) {
                return;
            }


            await submitComment(
                name,
                body,
                parentId
            );

        }
    );


    container.appendChild(
        form
    );
}


/* ========================================
   HAUPTKOMMENTAR ABSENDEN
   ======================================== */

commentForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            commentName.value.trim();


        const body =
            commentBody.value.trim();


        if (!name || !body) {
            return;
        }


        await submitComment(
            name,
            body,
            null
        );


        commentName.value = "";
        commentBody.value = "";
    }
);


/* ========================================
   KOMMENTAR SPEICHERN
   ======================================== */

async function submitComment(
    name,
    body,
    parentId
) {

    commentStatus.textContent =
        "Wird gespeichert ...";


    try {

        const response =
            await fetch(
                `${COMMENTS_API}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        eventSlug:
                            commentEventSlug,

                        name:
                            name,

                        body:
                            body,

                        parentId:
                            parentId
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
                || "Kommentar konnte nicht gespeichert werden."
            );
        }


        commentStatus.textContent =
            "Gespeichert.";


        await loadComments();


        setTimeout(
            () => {

                commentStatus.textContent =
                    "";

            },
            2000
        );


    } catch (error) {

        commentStatus.textContent =
            error.message;

        console.error(error);
    }
}


/* ========================================
   DATUM FORMATIEREN
   ======================================== */

function formatCommentDate(date) {

    return date.toLocaleDateString(
        "de-AT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ========================================
   START
   ======================================== */

loadComments();