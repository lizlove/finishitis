"use strict";

const path = require("path");
const _ = require("lodash");
const moment = require("moment");
const createCategoriesPages = require("./pagination/create-categories-pages.js");
const createTagsPages = require("./pagination/create-tags-pages.js");
const createPostsPages = require("./pagination/create-posts-pages.js");

const createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // 404
  createPage({
    path: "/404",
    component: path.resolve("./src/templates/not-found-template.js")
  });

  // Tags list
  createPage({
    path: "/tags",
    component: path.resolve("./src/templates/tags-list-template.js")
  });

  // Categories list
  createPage({
    path: "/categories",
    component: path.resolve("./src/templates/categories-list-template.js")
  });

  // Posts and pages from markdown
  const result = await graphql(`
    {
      allMarkdownRemark(filter: { frontmatter: { draft: { ne: true } } }) {
        edges {
          node {
            frontmatter {
              template
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  const { edges } = result.data.allMarkdownRemark;
  const otiAge = moment("20190513", "YYYYMMDD")
    .fromNow()
    .replace("ago", "old");
  const projectAge = moment().diff("20191031", "days");
  console.log(`🗓️  Oti is ${otiAge}.`);
  console.log(`🗓️  Finishitis is ${projectAge} days old.`);

  _.each(edges, edge => {
    if (_.get(edge, "node.frontmatter.template") === "page") {
      createPage({
        path: edge.node.fields.slug,
        component: path.resolve("./src/templates/page-template.js"),
        context: { slug: edge.node.fields.slug, otiAge: otiAge }
      });
    } else if (_.get(edge, "node.frontmatter.template") === "post") {
      createPage({
        path: edge.node.fields.slug,
        component: path.resolve("./src/templates/post-template.js"),
        context: { slug: edge.node.fields.slug }
      });
    }
  });

  // Feeds
  await createTagsPages(graphql, actions);
  await createCategoriesPages(graphql, actions);
  await createPostsPages(graphql, actions);
};

module.exports = createPages;
