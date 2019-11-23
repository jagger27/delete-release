const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const tagName = core.getInput('tag_name', { required: true });

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = tagName.replace('refs/tags/', '');

    const getReleaseByTagResponse = await github.repos.getReleaseByTag({
      owner,
      repo,
      tag
    });

    // Get the ID, html_url, and upload URL for the created Release from the response
    const {
      data: { id: releaseId }
    } = getReleaseByTagResponse;

    const deleteReleaseResponse = await github.repos.deleteRelease({
      owner: owner,
      repo: repo,
      id: releaseId
    });

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', releaseId);
    core.setOutput('delete_response', deleteReleaseResponse.status);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
