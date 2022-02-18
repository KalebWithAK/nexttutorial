import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')


export function getSortedPostsData() {
    // get filenames under /posts
    const fileNames = fs.readdirSync(postsDirectory)

    const allPostsData = fileNames.map(fileName => {
        // remove ".md" from all filenames to get id
        const id = fileName.replace(/\.md/, '')

        // read markdown file as string
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf-8')

        // use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)

        // combine the data with the id
        return { id, ...matterResult.data }
    })
    
    // sort all posts by date
    return allPostsData.sort(({ date: a}, { date: b}) => {
        return a < b ? 1 : a > b ? -1 : 0
    })
}

export function getAllPostIds() {
    /*
        Returns an array that looks like this:
        [
            { params: { id: 'ssg-ssr' }},
            { params: { id: 'prerendering' }}
        ]
    */

    const fileNames = fs.readdirSync(postsDirectory)
    
    return fileNames.map(fileName => {
        return { params: { id: fileName.replace(/\.md/, '') }}
    })
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')

    // use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // use remark to convert markdown into html string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const contentHtml = processedContent.toString()

    // combine data with the id and contentHtml
    return { id, contentHtml, ...matterResult.data}
}