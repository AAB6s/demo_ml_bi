# Job Posting Segmentation Script
# This script performs segmentation of job postings based on unique job titles.
# It loads the dataset, processes text and numeric features, assigns clusters by job title,
# classifies clusters, inspects them, visualizes with t-SNE, and saves the results.

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import MiniBatchKMeans
import matplotlib.pyplot as plt

# 1) Load dataset
# Read the prepared job postings dataset from CSV file
df = pd.read_csv('prepared_jobs_dataset.csv')

# Fill missing values in key text columns to avoid errors
df['skill_text'] = df['skill_text'].fillna('')
df['job_title_short'] = df['job_title_short'].fillna('')
df['company_name'] = df['company_name'].fillna('')

# Combine text columns into a single clean text field for vectorization
df['clean_text'] = df['job_title_short'] + ' ' + df['company_name'] + ' ' + df['skill_text']

# 2) TF-IDF vectorization
# Convert text to numerical features using TF-IDF with bigrams and limited features
tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
X_text = tfidf.fit_transform(df['clean_text'])

# Optional: reduce dimensionality for faster clustering
# Use SVD to reduce TF-IDF dimensions to 100 for efficiency
svd = TruncatedSVD(n_components=100, random_state=42)
X_reduced = svd.fit_transform(X_text)

# 3) Standardize numeric features (optional, if added)
# Create numeric features: number of skills and title length
df['num_skills'] = df['skill_text'].apply(lambda x: len(x.split()))
df['title_len'] = df['job_title_short'].apply(lambda x: len(x.split()))
numeric_features = df[['num_skills', 'title_len']].values
# Standardize numeric features to have mean 0 and variance 1
numeric_features = StandardScaler().fit_transform(numeric_features)

# Combine all features: reduced text + numeric
X = np.hstack([X_reduced, numeric_features])

# 4) Assign clusters based on job_title_short (since there are exactly 10 unique titles)
# Use categorical encoding to assign cluster IDs based on unique job titles
df['cluster'] = df['job_title_short'].astype('category').cat.codes
n_clusters = df['cluster'].nunique()

# 4.5) Classify clusters by job_title_short (each cluster is a unique title)
# Create a dictionary mapping cluster ID to the most common (mode) job title in that cluster
cluster_labels = {}
for i in range(n_clusters):
    cluster_data = df[df['cluster'] == i]
    if not cluster_data.empty:
        mode_title = cluster_data['job_title_short'].mode()
        if not mode_title.empty:
            cluster_labels[i] = mode_title[0]
        else:
            cluster_labels[i] = f'Cluster {i}'
    else:
        cluster_labels[i] = f'Cluster {i}'

# Add a column with human-readable cluster labels
df['cluster_label'] = df['cluster'].map(cluster_labels)

# 5) Inspect clusters
# Print details for each cluster: label and sample job postings
for i in range(n_clusters):
    label = cluster_labels.get(i, f'Cluster {i}')
    print(f"\nCluster {i} ({label}):")
    print(df[df['cluster']==i][['job_title_short','company_name']].head(5))

# 6) Optional: visualize clusters (2D)
# Use t-SNE for 2D visualization of the high-dimensional features, colored by cluster
from sklearn.manifold import TSNE
tsne = TSNE(n_components=2, random_state=42, perplexity=50)
X_tsne = tsne.fit_transform(X)
plt.figure(figsize=(10,6))
plt.scatter(X_tsne[:,0], X_tsne[:,1], c=df['cluster'], cmap='tab20', s=2)
plt.title("Job Posting Clusters")
plt.show()

# 7) Save segmented data
# Export the DataFrame with cluster assignments to CSV
df.to_csv('segmented_job_postings.csv', index=False)
print("Segmented job postings saved to: segmented_job_postings.csv")