import argparse
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Define sentences


def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description='Compute cosine similarity between two code snippets.')
    parser.add_argument('code1', type=str, help='First code snippet')
    parser.add_argument('code2', type=str, help='Second code snippet')
    args = parser.parse_args()

    # Load pre-trained SentenceTransformer model
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    codes = [args.code1, args.code2]
    # Compute sentence embeddings
    embeddings = model.encode(codes)

    # Compute cosine similarity
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])

    # Print similarity score
    if (similarity * 100 > 70.0):
        flag = True
    else:
        flag = False

    print(flag)


if (__name__ == "__main__"):
    main()
