<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the imported Ads Manager routes and demo store so visual changes do not change existing campaign data or behavior.
- Define reference appearance in src/styles.css and reuse shared controls and vector icons for consistent sizing.
- Store imported media as Lovable Asset pointers so original campaign images remain available in this project.
- Keep the add-funds screen in a dedicated browser-side flow with expiring non-payable demo QR requests; credit the demo store only after explicit simulation so opening a QR never claims a real payment.
- Pass engagement setup selections as validated editor search parameters so quick choices reuse the imported campaign editor without duplicating campaign storage.
